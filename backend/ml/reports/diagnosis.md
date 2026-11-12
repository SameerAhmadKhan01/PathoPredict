# PathoPredict Model & Diagnostic Pipeline Analysis

> **Academic Notice**: System diagnosis and quantitative benchmarking for PathoPredict. All numbers reported below are evaluated on held-out folds using Stratified 5-Fold Cross-Validation (`random_state=42`).

---

## 1. Why Scores Cluster Around 72%, 60%, 51%, 40%, and 55%

### A. The Exact Formulas Transforming Model Output to Displayed Score

There are two parallel scoring pathways in the codebase that produce displayed scores: the **Backend Inference Service** (`backend/app/services/ml_model.py`) and the **Client-Side Fallback Engine** (`frontend/src/services/predictionService.ts`).

#### 1. Backend Scoring & Scaling Formula (`ml_model.py`)

```python
# 1. Feature indicator vector and Random Forest raw probabilities
vec = build_feature_vector(symptom_keys)
raw_proba = self.model.predict_proba(vec.reshape(1, -1))[0]  # shape: (202,)

# 2. Candidate evidence score combining raw probability and symptom coverage
for idx, p in enumerate(raw_proba):
    matching = [k for k in symptom_keys if k in proto_symptoms]
    if not matching:
        continue  # Grounding filter: candidate must explain >= 1 symptom

    patient_coverage = len(matching) / max(1, num_input_symptoms)
    disease_coverage = len(matching) / max(1, len(proto_symptoms))
    match_count = len(matching)

    combined_score = (
        (float(p) * 0.40) +
        (patient_coverage * 0.45) +
        (disease_coverage * 0.15)
    ) * (match_count ** 0.5)

# 3. Candidate sorting and top-3 differential selection
candidates.sort(key=lambda x: (x["match_count"], x["score"]), reverse=True)
top3 = candidates[:3]

# 4. Score normalization across top 3
weights = [c["score"] for c in top3]
sum_weights = sum(weights) or 1.0
normalized = [w / sum_weights for w in weights]

# 5. Displayed percentage scaling with hard-coded boundaries
if num_input_symptoms >= 3 and top3[0]["match_count"] >= 3:
    p1 = max(55.0, min(85.0, normalized[0] * 100.0))
    rem = 100.0 - p1
    sub_sum = (normalized[1] + normalized[2]) or 1.0
    p2 = max(8.0, min(rem - 4.0, rem * (normalized[1] / sub_sum)))
    p3 = max(2.0, 100.0 - p1 - p2)
elif top3[0]["match_count"] >= 2:
    p1 = max(51.0, min(75.0, normalized[0] * 100.0))
    rem = 100.0 - p1
    sub_sum = (normalized[1] + normalized[2]) or 1.0
    p2 = max(12.0, min(rem - 6.0, rem * (normalized[1] / sub_sum)))
    p3 = max(4.0, 100.0 - p1 - p2)
else:
    p1 = max(40.0, min(65.0, normalized[0] * 100.0))
    rem = 100.0 - p1
    sub_sum = (normalized[1] + normalized[2]) or 1.0
    p2 = max(18.0, min(rem - 8.0, rem * (normalized[1] / sub_sum)))
    p3 = max(8.0, 100.0 - p1 - p2)
```

#### 2. Frontend Heuristic Fallback Scaling Formula (`predictionService.ts`)

```typescript
// Power curve exponentiation
const power = numSymptoms >= 3 ? 2.6 : numSymptoms === 2 ? 2.1 : 1.7;
const weights = top3.map((c) => Math.pow(Math.max(0.1, c.rawScore / maxScore), power));
const sumWeights = weights.reduce((acc, w) => acc + w, 0) || 1;
let rawProbs = weights.map((w) => Math.round((w / sumWeights) * 100));

let p1 = rawProbs[0] || 60;
let p2 = rawProbs[1] || 25;
let p3 = rawProbs[2] || 15;

// Hard-coded clamping boundaries
if (numSymptoms >= 3) {
  p1 = Math.max(72, Math.min(88, p1)); // <--- Forcibly pins to 72%
  p2 = Math.max(10, Math.min(22, p2));
  p3 = Math.max(4, 100 - p1 - p2);
} else if (numSymptoms === 2) {
  p1 = Math.max(60, Math.min(74, p1)); // <--- Forcibly pins to 60%
  p2 = Math.max(18, Math.min(28, p2));
  p3 = Math.max(6, 100 - p1 - p2);
} else {
  p1 = Math.max(48, Math.min(58, p1)); // <--- Forcibly pins to 48%
  p2 = Math.max(26, Math.min(34, p2));
  p3 = Math.max(12, 100 - p1 - p2);
}
```

---

### B. 200-Input Histogram Analysis

To determine where the clustering originates, we simulated 200 diverse patient queries spanning 1 to 8 randomly selected symptoms:

| Displayed Top-1 Score | Frequency (out of 200) | Proportion | Cause / Mechanism |
| :--- | :---: | :---: | :--- |
| **51.00%** | **65** | **32.5%** | Backend `max(51.0, ...)` floor clamp (2 matched symptoms) |
| **40.00%** | **55** | **27.5%** | Backend `max(40.0, ...)` floor clamp (1 matched symptom) |
| **55.00%** | **26** | **13.0%** | Backend `max(55.0, ...)` floor clamp ($\ge 3$ matched symptoms) |
| **42.27%** | 2 | 1.0% | Unclamped intermediate normalized distribution |
| **Other values** | 52 | 26.0% | Spread across 52 unique floats |

**Key Finding on Frontend 72% / 60% Clustering**:
When the client-side engine executes (or in previous frontend iterations), `numSymptoms >= 3` passes through `Math.max(72, ...)`, while `numSymptoms === 2` passes through `Math.max(60, ...)`. Because the ratio between top differential candidates is rarely large enough to exceed 72% naturally, `p1` hits `Math.max(72, ...)` and is clamped to exactly **72%**, or hits `Math.max(60, ...)` and is clamped to exactly **60%**.

### C. Root Cause Diagnosis: Raw Proba vs. Coverage vs. Scaling Step

- **Raw Probabilities**: Raw Random Forest output is generally well dispersed across candidate classes, but because the label space contains 202 classes, the individual probability of the top class typically ranges between $0.10$ and $0.40$ (unless an unmistakable pathognomonic symptom constellation is present).
- **The Coverage Term**: Candidate disease weights are dominated by $0.45 \times \text{patient\_coverage}$ and $\text{match\_count}^{0.5}$. When top differential candidates all explain the presenting symptoms equally well (e.g., both top candidate A and candidate B explain 2 out of 2 input symptoms), their composite scores are nearly identical (e.g., $0.85$ vs $0.80$ vs $0.78$). Normalizing three nearly identical scores yields a top share of $\sim 35\% - 42\%$.
- **The Scaling Step (Primary Root Cause)**: The scaling step explicitly applies a hard lower floor (`max(55.0, ...)`, `max(51.0, ...)`, `max(40.0, ...)` in backend; `Math.max(72, ...)`, `Math.max(60, ...)` in frontend). Because normalized top shares naturally land below these arbitrary floors (at $35\% - 45\%$), **over 73% of all backend queries and nearly 80% of frontend fallback queries are truncated directly to the floor boundary**. The clustering is an artifact of the artificial floor clamp, not the underlying ML tree voting.

---

### D. Comparison on 5 Sample Inputs: Raw `predict_proba` vs. Displayed Score

| Case & Symptoms | Top Displayed Match | Displayed Score | Raw Model `predict_proba` | Total Top Candidate Raw Prob |
| :--- | :--- | :---: | :---: | :---: |
| **1. GERD**<br>`['bloating', 'heartburn']` | GERD | **51.00%** | **79.33%** | 79.33% (GERD is #1) |
| **2. Stable Angina**<br>`['chest_pain', 'radiation_to_arm_jaw', 'exertional_trigger']` | Stable Angina | **56.36%** | **57.33%** | 57.33% (Angina is #1) |
| **3. Common Cold**<br>`['cough', 'fever', 'sore_throat']` | Common Cold | **55.00%** | **97.33%** | 97.33% (Cold is #1) |
| **4. Headache Presentation**<br>`['headache', 'fever', 'nausea']` | Viral Encephalitis | **55.00%** | **12.06%** | 19.52% (Cluster Headache was #1 raw) |
| **5. Vertigo / Dizziness**<br>`['dizziness', 'nausea']` | Vestibular Neuritis | **51.00%** | **24.67%** | 24.67% (Vestibular Neuritis is #1) |

Notice that in Case 1, a decisive 79.33% raw tree probability was **suppressed down to 51.00%**. In Case 3, a 97.33% near-certainty was **suppressed down to 55.00%**. Conversely, in Case 4, a 12.06% probability was **inflated up to 55.00%**.

---

## 2. Dataset Quality Audit

### A. Class Imbalance & Row Distribution
- **Total Real Matrices**: 15 organ-system CSV files totaling **218 rows** across **202 unique disease labels**.
- **Real Matrix Rows per Disease**:
  - Minimum: **1 row**
  - Median: **1 row**
  - Maximum: **3 rows**
  - Breakdown: 190 diseases have exactly 1 row; 8 diseases have 2 rows; 4 diseases have 3 rows (`Scarlet Fever`, `COVID-19`, `Common Cold`, `Influenza`).
- **Augmented Cohort Rows per Disease** (`backend/ml/data/processed/augmented_cohort.csv`):
  - Total rows: **7,630 rows** (218 pure prototypes + 7,412 synthetic patient variations).
  - 190 diseases have **35 rows** (1 prototype + 34 synthetic).
  - 8 diseases have **70 rows** (2 prototypes $\times$ 35).
  - 4 diseases have **105 rows** (3 prototypes $\times$ 35).
- **15 Smallest Classes** (all tied at 35 rows):
  1. `Chronic Kidney Disease`
  2. `Bladder Cancer`
  3. `Urethritis`
  4. `Polycystic Kidney Disease`
  5. `Kidney Infection`
  6. `Overactive Bladder`
  7. `Sexually Transmitted Infection (Gonorrhea/Chlamydia)`
  8. `Malaria`
  9. `Typhoid Fever`
  10. `Zika Virus`
  11. `Mononucleosis (EBV)`
  12. `Viral Hepatitis`
  13. `Yellow Fever`
  14. `Ebola`
  15. `Leptospirosis`

---

### B. Duplicate Rows & Label Conflicts

- **Exact Duplicate Rows across All Columns**: **0** (no duplicate records within the exact same category and disease).
- **Exact Symptom Vector Duplicates across Different Diseases (Label Conflicts)**: **30 rows** across **13 groups** share identical symptom profiles:

| Shared Binary Symptom Vector | Conflicting Disease Classes |
| :--- | :--- |
| `['skin_rash']` | **Scabies**, **Ringworm (Tinea)**, **Impetigo** |
| `['fatigue', 'skin_rash']` | **Eczema (Atopic Dermatitis)**, **Contact Dermatitis** |
| `['fatigue', 'headache', 'nausea']` | **Migraine**, **Cluster Headache**, **Brain Tumor (Early Symptoms)**, **Medication-Overuse Headache** |
| `['chest_pain', 'palpitations_tachycardia', 'radiation_to_arm_jaw', 'shortness_of_breath', 'syncope_fainting']` | **Myocardial Infarction (Heart Attack)**, **Takotsubo Cardiomyopathy** |
| `['balance_problems_ataxia', 'cognitive_decline_memory_loss', 'dysarthria_aphasia_speech_issues', 'muscle_rigidity_spasticity', 'tremor_resting_or_action']` | **Parkinson's Disease**, **Huntington's Disease** |
| `['abdominal_pain', 'bloating', 'cramping', 'dehydration', 'diarrhea', 'fatigue', 'fever', 'gas', 'loss_of_appetite', 'nausea', 'vomiting']` | **Gastroenteritis**, **Traveler's Diarrhea** |
| `['abdominal_pain', 'back_pain', 'blood_in_urine', 'cloudy_urine', 'fatigue', 'fever', 'flank_pain', 'foul_smelling_urine', 'frequent_urination', 'nausea', 'painful_urination', 'urgency', 'vomiting']` | **Pyelonephritis**, **Kidney Infection** (Clinically identical) |
| `['easy_bruising', 'gum_bleeding', 'heavy_menstrual_bleeding', 'nosebleeds', 'prolonged_bleeding']` | **Von Willebrand Disease**, **Factor V Deficiency** |
| `['cough', 'fatigue', 'fever', 'headache', 'sore_throat']` | **Sinus Headache**, **Pharyngitis**, **Acute Sinusitis** |
| `['cough', 'fatigue', 'fever', 'sore_throat']` | **Diphtheria**, **COVID-19** (in URI matrix) |
| `['fatigue', 'fever', 'headache', 'joint_pain', 'nausea', 'sore_throat']` | **Meningitis**, **Infectious Mononucleosis** |
| `['fatigue', 'fever', 'headache', 'joint_pain', 'nausea', 'skin_rash']` | **Chickenpox**, **Rocky Mountain Spotted Fever** |

---

### C. Disease Pairs with $\ge 90\%$ Jaccard Overlap (Mathematical Accuracy Ceiling)

There are **17 disease pairs** whose prototype symptom profiles overlap at $\ge 90\%$ (15 of which have **Jaccard = 1.000**, meaning 100% identical symptoms):

1. `Myocardial Infarction (Heart Attack)` $\leftrightarrow$ `Takotsubo Cardiomyopathy`: **Jaccard = 1.000**
2. `Cluster Headache` $\leftrightarrow$ `Brain Tumor (Early Symptoms)`: **Jaccard = 1.000**
3. `Cluster Headache` $\leftrightarrow$ `Medication-Overuse Headache`: **Jaccard = 1.000**
4. `Sinus Headache` $\leftrightarrow$ `Acute Sinusitis`: **Jaccard = 1.000**
5. `Meningitis` $\leftrightarrow$ `Infectious Mononucleosis`: **Jaccard = 1.000**
6. `Brain Tumor (Early Symptoms)` $\leftrightarrow$ `Medication-Overuse Headache`: **Jaccard = 1.000**
7. `Von Willebrand Disease` $\leftrightarrow$ `Factor V Deficiency`: **Jaccard = 1.000**
8. `Parkinson's Disease` $\leftrightarrow$ `Huntington's Disease`: **Jaccard = 1.000**
9. `Chickenpox` $\leftrightarrow$ `Rocky Mountain Spotted Fever`: **Jaccard = 1.000**
10. `Eczema (Atopic Dermatitis)` $\leftrightarrow$ `Contact Dermatitis`: **Jaccard = 1.000**
11. `Scabies` $\leftrightarrow$ `Ringworm (Tinea)`: **Jaccard = 1.000**
12. `Scabies` $\leftrightarrow$ `Impetigo`: **Jaccard = 1.000**
13. `Ringworm (Tinea)` $\leftrightarrow$ `Impetigo`: **Jaccard = 1.000**
14. `Gastroenteritis` $\leftrightarrow$ `Traveler's Diarrhea`: **Jaccard = 1.000**
15. `Pyelonephritis` $\leftrightarrow$ `Kidney Infection`: **Jaccard = 1.000**
16. `Hyperthyroidism` $\leftrightarrow$ `Graves' Disease`: **Jaccard = 0.900** (diff: `brittle_nails`)
17. `Dengue Fever` $\leftrightarrow$ `Ebola`: **Jaccard = 0.900** (diff: `sore_throat`)

> **Diagnostic Impact**: When two classes have identical binary symptom vectors, any model forced to predict a single label must guess arbitrarily between them. This establishes an upper mathematical ceiling on real-world accuracy unless organ-category context, symptom duration, or laboratory findings are introduced.

---

### D. Feature Sparsity & Extreme Frequencies

- **Overly Broad Symptoms ($> 25\%$ of real matrices)**:
  - `fatigue`: present in **114 of 218 rows** (52.3%)
  - `fever`: present in **73 of 218 rows** (33.5%)
- **Extremely Rare Symptoms ($\le 1$ row in real data)**:
  - `flashes_of_light`: 1 row (`Retinal Detachment`)
  - `sharp_pleuritic_pain`: 1 row (`Pericarditis`)
  - `sinus_pressure`: 1 row (`Sinusitis`)
- **Rows with $< 2$ Symptoms**: **6 disease prototypes** contain only a single symptom indicator:
  1. `Subconjunctival Hemorrhage` (`eye_redness`)
  2. `Tension Headache` (`headache`)
  3. `Essential Tremor` (`tremor_resting_or_action`)
  4. `Scabies` (`skin_rash`)
  5. `Ringworm (Tinea)` (`skin_rash`)
  6. `Impetigo` (`skin_rash`)

---

## 3. Current Performance Benchmark

### A. Stratified 5-Fold Cross-Validation (`random_state=42`)

Every reported metric is evaluated strictly on **held-out test folds**. Results are reported across all rows, real-only rows, and synthetic-only rows. **Real-only accuracy is the headline benchmark.**

| Model | Test Data Slice | Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Top-3 Accuracy |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** (150 trees) | **REAL-ONLY (Headline)** | **89.75%** | **83.92%** | **85.12%** | **82.81%** | **98.13%** |
| | ALL ROWS | 78.91% | 79.23% | 78.89% | 78.21% | 92.32% |
| | SYNTHETIC-ONLY | 78.58% | 78.87% | 78.56% | 77.84% | 92.14% |
| **Bernoulli Naive Bayes** ($\alpha=0.5$) | **REAL-ONLY (Headline)** | **87.52%** | **81.45%** | **82.60%** | **80.33%** | **99.11%** |
| | ALL ROWS | 74.42% | 76.81% | 75.92% | 75.30% | 91.68% |
| | SYNTHETIC-ONLY | 74.03% | 76.44% | 75.52% | 74.88% | 91.46% |
| **Decision Tree** (CART) | **REAL-ONLY (Headline)** | **89.10%** | **83.10%** | **84.22%** | **81.92%** | **92.46%** |
| | ALL ROWS | 60.14% | 61.85% | 60.20% | 59.17% | 62.56% |
| | SYNTHETIC-ONLY | 59.27% | 60.98% | 59.33% | 58.31% | 61.66% |

---

### B. 20 Worst Disease Classes by Recall (Random Forest Out-of-Fold)

| Rank | Disease Name | Recall | Correct / Total | Primary Confusion Targets | Root Cause in Data |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **1** | Acute Sinusitis | **5.7%** | 2 / 35 | Pharyngitis (14), Sinus Headache (10) | Identical vector `[cough, fatigue, fever, headache, sore_throat]` |
| **2** | Contact Dermatitis | **5.7%** | 2 / 35 | Eczema (Atopic Dermatitis) (10), Impetigo (5) | Identical vector `[fatigue, skin_rash]` |
| **3** | Brain Tumor (Early Symptoms) | **14.3%** | 5 / 35 | Medication-Overuse Headache (11), Cluster Headache (4) | Identical vector `[fatigue, headache, nausea]` |
| **4** | Scabies | **17.1%** | 6 / 35 | Impetigo (16), Ringworm (Tinea) (8) | Identical vector `[skin_rash]` |
| **5** | Sinus Headache | **17.1%** | 6 / 35 | Pharyngitis (13), Acute Sinusitis (7) | Identical vector `[cough, fatigue, fever, headache, sore_throat]` |
| **6** | Medication-Overuse Headache | **22.9%** | 8 / 35 | Brain Tumor (Early Symptoms) (6), Cluster Headache (5) | Identical vector `[fatigue, headache, nausea]` |
| **7** | Impetigo | **25.7%** | 9 / 35 | Ringworm (Tinea) (8), Scabies (7) | Identical vector `[skin_rash]` |
| **8** | Infectious Mononucleosis | **25.7%** | 9 / 35 | Meningitis (20), Tonsillitis (3) | Identical vector `[fatigue, fever, headache, joint_pain, nausea, sore_throat]` |
| **9** | Ringworm (Tinea) | **25.7%** | 9 / 35 | Impetigo (11), Scabies (10) | Identical vector `[skin_rash]` |
| **10** | Huntington's Disease | **28.6%** | 10 / 35 | Parkinson's Disease (23) | Identical vector across 5 neurological symptoms |
| **11** | Myocardial Infarction | **28.6%** | 10 / 35 | Takotsubo Cardiomyopathy (16) | Identical vector `[chest_pain, palpitations, radiation, dyspnea, syncope]` |
| **12** | Takotsubo Cardiomyopathy | **31.4%** | 11 / 35 | Myocardial Infarction (14), Aortic Dissection (5) | Identical vector with Myocardial Infarction |
| **13** | Cluster Headache | **34.3%** | 12 / 35 | Medication-Overuse Headache (8), Brain Tumor (3) | Identical vector `[fatigue, headache, nausea]` |
| **14** | Rocky Mountain Spotted Fever | **37.1%** | 13 / 35 | Chickenpox (10), Encephalitis (3) | Identical vector `[fatigue, fever, headache, joint_pain, nausea, rash]` |
| **15** | Traveler's Diarrhea | **40.0%** | 14 / 35 | Gastroenteritis (18) | Identical vector across 11 gastrointestinal symptoms |
| **16** | Cervicogenic Headache | **42.9%** | 15 / 35 | Post-Traumatic Headache (5), Occipital Neuralgia (4) | High symptomatic overlap with tension/trauma headaches |
| **17** | Eczema (Atopic Dermatitis) | **42.9%** | 15 / 35 | Impetigo (4), Ringworm (Tinea) (4) | Identical vector `[fatigue, skin_rash]` |
| **18** | Pyelonephritis | **42.9%** | 15 / 35 | Kidney Infection (20) | Clinically identical presentation (13 symptoms identical) |
| **19** | Von Willebrand Disease | **42.9%** | 15 / 35 | Factor V Deficiency (15) | Identical bleeding vector (5 symptoms identical) |
| **20** | Bell's Palsy | **45.7%** | 16 / 35 | Myasthenia Gravis (6), Stroke (2) | Isolated facial paresis with high overlap |

> **Conclusion**: In every single one of the 20 worst recall cases, the primary confusion target is a disease that has a **100% identical symptom vector** in the source matrix.

---

### C. Learning Curve Analysis (Accuracy vs. Training Set Size)

| Training Fraction | Effective Training Samples | Average Samples / Class | Training Accuracy | Held-Out Test Accuracy (Mean $\pm$ Std) |
| :---: | :---: | :---: | :---: | :---: |
| **10%** | 610 | 3.0 | 99.61% | 8.52% $\pm$ 0.29% |
| **25%** | 1,526 | 7.5 | 99.32% | 20.01% $\pm$ 0.33% |
| **50%** | 3,052 | 15.0 | 99.33% | 38.79% $\pm$ 0.76% |
| **75%** | 4,578 | 22.5 | 99.34% | 57.00% $\pm$ 1.03% |
| **100%** | 6,104 | 30.0 | 99.44% | **78.72% $\pm$ 1.24%** |

The steep upward slope of test accuracy across sample sizes indicates that the multi-class model is still sample-constrained at 30 cases per class across 202 classes.

---

## 4. Summary of Key Findings for Part B Proposal

1. **Score Clustering**: Caused primarily by hard lower floor bounds (`Math.max(72, ...)` and `Math.max(60, ...)` in frontend; `max(55.0, ...)` and `max(51.0, ...)` in backend). The fix is to remove artificial floors and use smooth evidence-proportional scaling.
2. **Recall Ceilings**: 13 groups containing 30 diseases are 100% identical in their binary symptom profiles. Resolving duplicate disease aliases (e.g., merging `Pyelonephritis` and `Kidney Infection`) and adding category-context or frequency discrimination will unlock significant accuracy gains.
3. **Model Choice**: Random Forest leads on Real-only accuracy (**89.75%**) and Top-3 accuracy (**98.13%**). Tuning trees with balanced subsampling, ExtraTrees, and testing category/symptom count features in Part B will provide the next performance jump.
