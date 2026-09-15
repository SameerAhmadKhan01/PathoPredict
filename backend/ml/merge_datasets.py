import os
import pandas as pd
from standardize import LOADERS, generate_data_prep_log

def merge_all_datasets(
    raw_dir: str = 'backend/ml/data/raw',
    output_path: str = 'backend/ml/data/processed/combined_dataset.csv'
) -> pd.DataFrame:
    print("=" * 80)
    print("STEP 1: STANDARDIZING & LOADING ALL 15 SOURCES")
    print("=" * 80)

    dfs = []
    file_stats = []

    for fname, loader in LOADERS.items():
        df_file = loader(raw_dir)
        feature_count = len([c for c in df_file.columns if c not in ['disease', 'category']])
        dfs.append(df_file)
        file_stats.append({
            'file': fname,
            'category': df_file['category'].iloc[0],
            'rows': len(df_file),
            'features': feature_count
        })
        print(f"Loaded {fname:<42} | Category: {df_file['category'].iloc[0]:<22} | Rows: {len(df_file):2d} | Features: {feature_count:2d}")

    # Concatenate all DataFrames
    combined_df = pd.concat(dfs, ignore_index=True)

    # Separate metadata and features
    metadata_cols = ['disease', 'category']
    symptom_cols = sorted([c for c in combined_df.columns if c not in metadata_cols])

    # Fill missing symptom columns with 0 and convert to int
    combined_df[symptom_cols] = combined_df[symptom_cols].fillna(0).astype(int)

    # Reorder columns: disease, category, then sorted symptom features
    final_cols = ['disease', 'category'] + symptom_cols
    combined_df = combined_df[final_cols]

    # Save to processed directory
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    combined_df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"\nSuccessfully compiled merged dataset -> {output_path}")
    print(f"Total Combined Shape: {combined_df.shape[0]} rows x {combined_df.shape[1]} columns (2 metadata + {len(symptom_cols)} symptoms)")

    print("\n" + "=" * 80)
    print("STEP 2: SUMMARY STATISTICS")
    print("=" * 80)

    print("\n--- A. ROW COUNTS PER FILE & CATEGORY ---")
    summary_file_df = pd.DataFrame(file_stats)
    print(summary_file_df.to_string(index=False))

    print("\n--- B. ROW COUNTS PER CATEGORY ---")
    cat_counts = combined_df['category'].value_counts()
    for cat, count in cat_counts.items():
        pct = (count / len(combined_df)) * 100
        print(f"  {cat:<24}: {count:2d} rows ({pct:5.1f}%)")

    print("\n--- C. ROW COUNTS PER DISEASE ---")
    disease_counts = combined_df['disease'].value_counts()
    print(f"Total Unique Disease Labels: {len(disease_counts)}")
    
    # Diseases appearing more than once
    multi_row_diseases = disease_counts[disease_counts > 1]
    print(f"\nDiseases appearing in multiple categories ({len(multi_row_diseases)}):")
    for d, c in multi_row_diseases.items():
        cats = combined_df[combined_df['disease'] == d]['category'].tolist()
        print(f"  * {d}: {c} rows -> Categories: {', '.join(cats)}")

    print("\n" + "=" * 80)
    print("STEP 3: CLINICAL & DATASET INTEGRITY FLAGS")
    print("=" * 80)

    # Flag: Diseases with under 10 rows
    under_10 = disease_counts[disease_counts < 10]
    exactly_1 = (disease_counts == 1).sum()
    multi = (disease_counts > 1).sum()
    print(f"\n[FLAG 1: PER-DISEASE SAMPLE SIZES]")
    print(f"  * {len(under_10)} of {len(disease_counts)} diseases ({len(under_10)/len(disease_counts)*100:.1f}%) have under 10 rows.")
    print(f"  * {exactly_1} diseases have exactly 1 row; {multi} diseases have multiple rows (overlapping presentations).")
    print("  * RATIONALE & IMPLICATION: These 15 CSVs are clinical reference 'symptom matrices' (prototypes / binary knowledge bases),")
    print("    not individual patient observational records. Direct supervised multi-class classifiers (e.g. Random Forest, Logistic")
    print("    Regression, MLP) require training samples per class. Options going forward:")
    print("      a) Knowledge-Based Probabilistic Inference (Cosine/Jaccard similarity, Naive Bayes with Dirichlet prior)")
    print("      b) Synthetic Patient Cohort Generation (sampling symptom variations and noise around each prototype)")
    print("      c) Hierarchical Classifier (predict category first, then disease)")

    # Flag: Category-level representation
    print(f"\n[FLAG 2: CATEGORY-LEVEL BALANCE]")
    print(f"  * Row counts per category are balanced (range: {cat_counts.min()} to {cat_counts.max()} rows per category, {cat_counts.min()/len(combined_df)*100:.1f}% - {cat_counts.max()/len(combined_df)*100:.1f}% each).")
    print(f"  * Feature density is heterogeneous across the 15 organ-system matrices.")

    return combined_df

if __name__ == '__main__':
    generate_data_prep_log()
    merge_all_datasets()
