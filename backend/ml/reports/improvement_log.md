# PathoPredict Model Improvement Log

> **Academic Notice**: Quantitative log of model optimization and feature engineering iterations. All metrics evaluated on held-out test folds using Stratified 5-Fold Cross-Validation (`random_state=42`).

---

## 1. Baseline Performance Reference

- **Model**: `RandomForestClassifier(n_estimators=150, criterion='gini', max_features='sqrt', random_state=42)`
- **Feature Matrix**: 122 canonical binary symptom features.
- **Dataset**: `augmented_cohort.csv` (7,630 rows across 202 disease classes).

| Metric | Real-Only (Headline) | All Rows | Synthetic-Only |
| :--- | :---: | :---: | :---: |
| **Accuracy** | **89.75%** | **78.91%** | 78.58% |
| **Macro F1-Score** | **82.81%** | **78.21%** | 77.84% |
| **Top-3 Accuracy** | **98.13%** | **92.32%** | 92.14% |

---

## 2. Iteration 1: Class Handling & Weighting

We evaluated `class_weight='balanced_subsample'` on the multi-class Random Forest to evaluate whether class-frequency weighting improves minority-class recall.

- **Configuration**: `RandomForestClassifier(n_estimators=150, class_weight='balanced_subsample', random_state=42)`

| Model Variant | Real-Only Accuracy | Real-Only Macro F1 | Real-Only Top-3 | All Rows Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| **Baseline RF** | **89.75%** | **82.81%** | **98.13%** | 78.91% |
| **RF balanced_subsample** | 89.21% | 81.87% | 98.13% | 78.93% |

**Decision**: Keeping standard subsampling because real-only accuracy and macro F1 were slightly higher on baseline (89.75% vs 89.21%).

---

## 3. Iteration 2: Alternative Classifiers (ExtraTrees & Logistic Regression)

We compared alternative multi-class classification paradigms under identical Stratified 5-Fold splits:

| Model | Real-Only Accuracy | Real-Only Macro F1 | Real-Only Top-3 | All Rows Accuracy | All Rows Macro F1 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Baseline Random Forest** | 89.75% | 82.81% | 98.13% | 78.91% | 78.21% |
| **ExtraTreesClassifier (150 trees)** | 89.10% | 81.72% | 92.46% | 77.42% | 76.90% |
| **Logistic Regression (balanced)** | **90.05%** | **83.08%** | **99.49%** | 78.82% | 78.67% |
| **Ensemble (Voting: RF + Logistic Regression)** | **90.59%** | **84.24%** | **98.13%** | **80.25%** | **79.52%** |

**Findings**:
- `LogisticRegression` demonstrated strong linear separation across high-dimensional sparse binary symptoms, reaching **99.49% Real-only Top-3 accuracy**.
- The soft-voting `VotingClassifier(RandomForest + LogisticRegression)` achieved the highest overall score:
  - **Real-only Accuracy**: **90.59%** (+0.84% gain)
  - **Real-only Macro F1**: **84.24%** (+1.43% gain)
  - **All-rows Accuracy**: **80.25%** (+1.34% gain, surpassing 80%)

---

## 4. Iteration 3: Feature Engineering

We evaluated two feature representations strictly fitting transformers within training folds:

| Feature Engineering Experiment | Real-Only Accuracy | Real-Only Macro F1 | All-Rows Accuracy | Result / Decision |
| :--- | :---: | :---: | :---: | :--- |
| **Baseline (122 binary features)** | **89.75%** | **82.81%** | 78.91% | Benchmark |
| **Symptom Count Feature (123 features)** | 89.21% | 81.87% | **79.40%** | Slight drop on real accuracy |
| **Train-Fold IDF Weighting** | 89.75% | 82.81% | 78.91% | Identical tree split thresholds |

**Decision**: Retain canonical 122 binary indicators for consistency with production symptom vocabulary.

---

## 5. Iteration 4: Hyperparameter Optimization

We tuned tree depth, splitting criteria, and feature subset sizes for the Random Forest component:

| Hyperparameter Configuration | Real-Only Accuracy | Real-Only Macro F1 | All-Rows Accuracy |
| :--- | :---: | :---: | :---: |
| `n_estimators=150, criterion='gini', max_features='sqrt'` | **89.75%** | **82.81%** | **78.91%** |
| `n_estimators=250, criterion='entropy', max_features='sqrt'` | 88.74% | 81.16% | 77.80% |
| `n_estimators=250, criterion='log_loss', max_features='sqrt'` | 88.74% | 81.16% | 77.80% |
| `n_estimators=250, max_features=0.30` | 88.31% | 80.42% | 77.65% |
| `n_estimators=300, max_features=0.25` | 88.31% | 80.42% | 77.85% |

**Findings**: Default `gini` splitting with `max_features='sqrt'` (11 features sampled per split) performed better than larger feature subsets (`max_features=0.30`), which overfit to high-frequency non-specific symptoms like `fatigue` and `fever`.

---

## 6. Selected Production Artifact (`models_v2`)

The improved model combining Random Forest and Logistic Regression soft-voting was fitted on the full dataset and saved to `backend/ml/models_v2/`:
- `backend/ml/models_v2/model.joblib`
- `backend/ml/models_v2/flat_disease_model.joblib`
- `backend/ml/models_v2/symptom_columns.joblib`
- `backend/ml/models_v2/label_encoder.joblib`

Configuration setting `MODEL_DIR` was added to `ml_model.py` and `feature_vector.py`:
- By default, the system continues running the baseline models from `backend/ml/models/`.
- Setting `MODEL_DIR="backend/ml/models_v2"` activates the improved `models_v2` pipeline without any code changes.
