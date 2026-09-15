# Data Preparation & Vocabulary Standardization Log

Generated during Phase 1: Data Preprocessing & Unification (15 Clinical Sources).

## 1. Category Mapping

| Raw File | Target Column | Mapped Category |
|---|---|---|
| `cardiac_diseases_symptoms_matrix.csv` | `Cardiac Condition` | `cardiac` |
| `ear_nose_throat_dizziness_hearing.csv` | `Disease` | `ENT` |
| `eye_related_redness_pain_vision.csv` | `Disease` | `eye` |
| `headache_predominant.csv` | `disease` | `headache-predominant` |
| `hematological_bleeding_bruising.csv` | `Disease` | `hematological` |
| `mental_health12_.csv` | `Condition` | `mental health` |
| `neurological_diseases1.csv` | `Condition` | `neurological` |
| `skin_rash_dermatological.csv` | `disease` | `dermatological` |
| `sore_throat_fever_upper_respiratory.csv` | `disease` | `sore-throat/fever/URI` |
| `endocrine_metabolic.csv` | `Disease` | `endocrine/metabolic` |
| `gastrointestinal.csv` | `Disease` | `gastrointestinal` |
| `joint_and_muscle_pain.csv` | `Disease` | `musculoskeletal` |
| `respiratory.csv` | `Disease` | `respiratory` |
| `urinary_renal.csv` | `Disease` | `urinary/renal` |
| `viral_flu_like.csv` | `Disease` | `viral/systemic` |

## 2. Canonical Symptom Alias Map

| Raw Symptom Column | Canonical Feature ID | Clinical Rationale |
|---|---|---|
| `Ataxia / Loss of Balance` | `balance_problems_ataxia` | Standardized to unified cross-category feature |
| `Balance_Problems` | `balance_problems_ataxia` | Standardized to unified cross-category feature |
| `Body_Ache` | `muscle_pain` | Standardized to unified cross-category feature |
| `Chest Pain / Pressure` | `chest_pain` | Standardized to unified cross-category feature |
| `Chest_Pain` | `chest_pain` | Standardized to unified cross-category feature |
| `Cough` | `cough` | Standardized to unified cross-category feature |
| `Fatigue` | `fatigue` | Standardized to unified cross-category feature |
| `Fatigue / Low Energy` | `fatigue` | Standardized to unified cross-category feature |
| `Fever` | `fever` | Standardized to unified cross-category feature |
| `Fever / Chills` | `fever` | Standardized to unified cross-category feature |
| `Headache` | `headache` | Standardized to unified cross-category feature |
| `Joint_Pain` | `joint_pain` | Standardized to unified cross-category feature |
| `Muscle_Pain` | `muscle_pain` | Standardized to unified cross-category feature |
| `Muscle_Weakness` | `muscle_weakness` | Standardized to unified cross-category feature |
| `Nasal_Congestion` | `nasal_congestion` | Standardized to unified cross-category feature |
| `Nausea` | `nausea` | Standardized to unified cross-category feature |
| `Numbness` | `numbness_paresthesia` | Standardized to unified cross-category feature |
| `Numbness / Paresthesia` | `numbness_paresthesia` | Standardized to unified cross-category feature |
| `Rash` | `skin_rash` | Standardized to unified cross-category feature |
| `Runny_Nose` | `runny_nose` | Standardized to unified cross-category feature |
| `Shortness of Breath` | `shortness_of_breath` | Standardized to unified cross-category feature |
| `Shortness_of_Breath` | `shortness_of_breath` | Standardized to unified cross-category feature |
| `Skin_Rash` | `skin_rash` | Standardized to unified cross-category feature |
| `Sore_Throat` | `sore_throat` | Standardized to unified cross-category feature |
| `Swollen_Joints` | `swollen_joints` | Standardized to unified cross-category feature |
| `Vomiting` | `vomiting` | Standardized to unified cross-category feature |
| `Weakness` | `muscle_weakness` | Standardized to unified cross-category feature |
| `chest_pain` | `chest_pain` | Standardized to unified cross-category feature |
| `cough` | `cough` | Standardized to unified cross-category feature |
| `fatigue` | `fatigue` | Standardized to unified cross-category feature |
| `fever` | `fever` | Standardized to unified cross-category feature |
| `headache` | `headache` | Standardized to unified cross-category feature |
| `joint_pain` | `joint_pain` | Standardized to unified cross-category feature |
| `nausea` | `nausea` | Standardized to unified cross-category feature |
| `rash` | `skin_rash` | Standardized to unified cross-category feature |
| `shortness_of_breath` | `shortness_of_breath` | Standardized to unified cross-category feature |
| `sore_throat` | `sore_throat` | Standardized to unified cross-category feature |

## 3. Preservation Decisions (Kept Distinct)

- **`sharp_pleuritic_pain`** vs. **`chest_pain`**: Kept distinct because pleuritic chest pain specifically discriminates pericarditis.
- **`chest_tightness`** vs. **`chest_pain`**: Kept distinct as both co-occur in `respiratory.csv` (asthma/bronchitis vs pleuritic/anginal).
- **`vertigo`** vs. **`dizziness`**: Kept distinct as separate columns present within ENT diagnosis.
- **`joint_pain`** vs. **`swollen_joints`** vs. **`joint_bleeding`**: Kept distinct to differentiate arthralgia, inflammatory effusion, and hemarthrosis.
- **`blurred_vision`** vs. **`vision_loss`** vs. **`visual_impairment_optic_neuritis`**: Maintained distinct ophthalmic and neuro-ophthalmic severity distinctions.
- **`tremor_resting_or_action`** vs. **`acute_panic_attacks_trembling`**: Kept distinct to separate neurological extrapyramidal tremors from autonomic anxiety tremors.
- **`stiffness`** vs. **`morning_stiffness`**: Maintained distinct because morning stiffness >30-60 min discriminates inflammatory rheumatoid disease from degenerative osteoarthritis.
