import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import BernoulliNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE

def generate_augmented_patient_cohort(
    prototype_df: pd.DataFrame,
    samples_per_prototype: int = 35,
    random_state: int = 42
) -> pd.DataFrame:
    """
    Generates realistic clinical patient samples from disease prototype vectors.
    Applies realistic clinical symptom perturbation:
    - Prototype symptoms (value 1) appear with 85% - 95% sensitivity (10-15% atypical omission).
    - Absent symptoms (value 0) have 2% - 4% noise rate (non-specific common overlap).
    """
    rng = np.random.RandomState(random_state)
    symptom_cols = [c for c in prototype_df.columns if c not in ['disease', 'category']]
    
    records = []
    
    for _, row in prototype_df.iterrows():
        disease = row['disease']
        category = row['category']
        proto_vec = row[symptom_cols].values.astype(int)
        
        # Always include the pure prototype
        proto_record = {'disease': disease, 'category': category}
        for col, val in zip(symptom_cols, proto_vec):
            proto_record[col] = val
        records.append(proto_record)
        
        # Generate noisy clinical patient presentations
        for _ in range(samples_per_prototype - 1):
            patient_vec = proto_vec.copy()
            
            # Sensitivity dropout on active symptoms: 10% - 15% dropout
            active_indices = np.where(proto_vec == 1)[0]
            if len(active_indices) > 1:
                # randomly drop 0, 1, or at most 2 symptoms if multiple exist
                num_drop = rng.choice([0, 1, 2], p=[0.60, 0.30, 0.10])
                num_drop = min(num_drop, len(active_indices) - 1) # always keep at least 1 key symptom
                if num_drop > 0:
                    dropped = rng.choice(active_indices, size=num_drop, replace=False)
                    patient_vec[dropped] = 0
                    
            # Background non-specific noise on inactive symptoms: 2.5% chance
            inactive_indices = np.where(proto_vec == 0)[0]
            noise_mask = rng.rand(len(inactive_indices)) < 0.025
            patient_vec[inactive_indices[noise_mask]] = 1
            
            record = {'disease': disease, 'category': category}
            for col, val in zip(symptom_cols, patient_vec):
                record[col] = int(val)
            records.append(record)
            
    df_augmented = pd.DataFrame(records)
    return df_augmented

def evaluate_models(
    df: pd.DataFrame,
    n_splits: int = 5,
    use_smote: bool = True,
    random_state: int = 42
):
    """
    Runs Stratified K-Fold CV comparing Decision Tree, Random Forest, and Bernoulli Naive Bayes.
    Applies SMOTE on training fold only (if use_smote is True and k_neighbors allows).
    Computes Accuracy, Macro Precision, Macro Recall, and Macro F1.
    """
    symptom_cols = [c for c in df.columns if c not in ['disease', 'category']]
    X = df[symptom_cols].values
    
    le = LabelEncoder()
    y = le.fit_transform(df['disease'].values)
    
    models = {
        'Decision Tree': DecisionTreeClassifier(random_state=random_state),
        'Random Forest': RandomForestClassifier(n_estimators=120, random_state=random_state, n_jobs=-1),
        'Naive Bayes (Bernoulli)': BernoulliNB(alpha=0.5)
    }
    
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    
    results = {name: {'accuracy': [], 'precision_macro': [], 'recall_macro': [], 'f1_macro': []} for name in models}
    
    # Store feature importances from Random Forest
    rf_feature_importances = np.zeros(len(symptom_cols))
    
    fold = 1
    for train_idx, test_idx in skf.split(X, y):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]
        
        # Apply SMOTE strictly on training fold only if requested
        if use_smote:
            # check min class count in train split
            class_counts = pd.Series(y_train).value_counts()
            min_count = class_counts.min()
            k_neighbors = min(2, min_count - 1)
            if k_neighbors >= 1:
                smote = SMOTE(k_neighbors=k_neighbors, random_state=random_state)
                X_train, y_train = smote.fit_resample(X_train, y_train)
                
        for name, clf in models.items():
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            
            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
            rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
            f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
            
            results[name]['accuracy'].append(acc)
            results[name]['precision_macro'].append(prec)
            results[name]['recall_macro'].append(rec)
            results[name]['f1_macro'].append(f1)
            
            if name == 'Random Forest':
                rf_feature_importances += clf.feature_importances_ / n_splits
                
        fold += 1
        
    summary = {}
    for name, metrics in results.items():
        summary[name] = {
            'accuracy_mean': float(np.mean(metrics['accuracy'])),
            'accuracy_std': float(np.std(metrics['accuracy'])),
            'precision_macro_mean': float(np.mean(metrics['precision_macro'])),
            'precision_macro_std': float(np.std(metrics['precision_macro'])),
            'recall_macro_mean': float(np.mean(metrics['recall_macro'])),
            'recall_macro_std': float(np.std(metrics['recall_macro'])),
            'f1_macro_mean': float(np.mean(metrics['f1_macro'])),
            'f1_macro_std': float(np.std(metrics['f1_macro'])),
        }
        
    return summary, rf_feature_importances, symptom_cols, le

if __name__ == '__main__':
    combined_path = 'backend/ml/data/processed/combined_dataset.csv'
    if not os.path.exists(combined_path):
        raise FileNotFoundError(f"Combined dataset not found at {combined_path}")
        
    proto_df = pd.read_csv(combined_path)
    print(f"Loaded prototype dataset with {len(proto_df)} rows and {proto_df['disease'].nunique()} unique diseases.")
    
    print("\nGenerating simulated clinical cohort (35 patient cases per prototype)...")
    cohort_df = generate_augmented_patient_cohort(proto_df, samples_per_prototype=35, random_state=42)
    print(f"Augmented cohort shape: {cohort_df.shape[0]} patient rows x {cohort_df.shape[1]} columns.")
    
    # Save cohort
    cohort_path = 'backend/ml/data/processed/augmented_cohort.csv'
    cohort_df.to_csv(cohort_path, index=False)
    print(f"Saved augmented cohort to {cohort_path}")
    
    print("\nRunning Stratified 5-Fold Cross-Validation (with SMOTE after split only)...")
    summary, rf_importances, symptom_cols, le = evaluate_models(cohort_df, n_splits=5, use_smote=True)
    
    print("\n" + "=" * 80)
    print("5-FOLD CV MODEL COMPARISON RESULTS (MACRO-AVERAGED)")
    print("=" * 80)
    for model_name, m in summary.items():
        print(f"\nModel: {model_name}")
        print(f"  Accuracy:        {m['accuracy_mean'] * 100:.2f}% (+/- {m['accuracy_std'] * 100:.2f}%)")
        print(f"  Macro Precision: {m['precision_macro_mean'] * 100:.2f}% (+/- {m['precision_macro_std'] * 100:.2f}%)")
        print(f"  Macro Recall:    {m['recall_macro_mean'] * 100:.2f}% (+/- {m['recall_macro_std'] * 100:.2f}%)")
        print(f"  Macro F1-Score:  {m['f1_macro_mean'] * 100:.2f}% (+/- {m['f1_macro_std'] * 100:.2f}%)")
        
    print("\n" + "=" * 80)
    print("TOP 15 MOST INFORMATIVE FEATURES (RANDOM FOREST)")
    print("=" * 80)
    feat_imp = sorted(zip(symptom_cols, rf_importances), key=lambda x: x[1], reverse=True)
    for rank, (feat, imp) in enumerate(feat_imp[:15], 1):
        print(f"  {rank:2d}. {feat:<40}: {imp * 100:.2f}%")
        
    # Save artifacts
    models_dir = 'backend/ml/models'
    os.makedirs(models_dir, exist_ok=True)
    
    # Save symptom columns list
    joblib.dump(symptom_cols, os.path.join(models_dir, 'symptom_columns.joblib'))
    joblib.dump(le, os.path.join(models_dir, 'label_encoder.joblib'))
    
    # Fit final best model on full augmented cohort
    X_full = cohort_df[symptom_cols].values
    y_full = le.transform(cohort_df['disease'].values)
    best_rf = RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1)
    best_rf.fit(X_full, y_full)
    joblib.dump(best_rf, os.path.join(models_dir, 'flat_disease_model.joblib'), compress=3)
    
    print(f"\nSaved artifacts in {models_dir}:")
    print("  * symptom_columns.joblib")
    print("  * label_encoder.joblib")
    print("  * flat_disease_model.joblib")
    
    with open('backend/ml/logs/cv_evaluation_report.json', 'w') as f:
        json.dump({
            'cv_summary': summary,
            'top_features': feat_imp[:25]
        }, f, indent=2)
    print("Saved CV metrics to backend/ml/logs/cv_evaluation_report.json")
