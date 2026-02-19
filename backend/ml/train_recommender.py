import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from skill_aliases import canonicalize_skill

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "Dataset.csv")
ARTIFACT_DIR = os.path.join(BASE_DIR, "artifacts")

os.makedirs(ARTIFACT_DIR, exist_ok=True)


def normalize(value):
    return str(value).strip().lower()


def text_to_skill_set(text):
    return set(
        [
            canonicalize_skill(item)
            for item in str(text).split(",")
            if canonicalize_skill(item)
        ]
    )


def build_features(df):
    candidate_skill_sets = df["candidate_skills"].apply(text_to_skill_set)
    required_skill_sets = df["job_required_skills"].apply(text_to_skill_set)

    overlap_count = []
    overlap_ratio = []
    location_match = []

    for cset, rset, cloc, jloc in zip(
        candidate_skill_sets,
        required_skill_sets,
        df["candidate_location"],
        df["job_location"],
    ):
        intersection = cset.intersection(rset)
        overlap_count.append(len(intersection))
        overlap_ratio.append(len(intersection) / len(rset) if len(rset) > 0 else 0.0)
        location_match.append(1 if normalize(cloc) == normalize(jloc) else 0)

    features = pd.DataFrame(
        {
            "candidate_experience_years": pd.to_numeric(
                df["candidate_experience_years"], errors="coerce"
            ).fillna(0),
            "job_min_experience_years": pd.to_numeric(
                df["job_min_experience_years"], errors="coerce"
            ).fillna(0),
            "overlap_count": overlap_count,
            "overlap_ratio": overlap_ratio,
            "location_match": location_match,
        }
    )

    features["experience_fit"] = np.where(
        features["job_min_experience_years"] > 0,
        np.minimum(
            features["candidate_experience_years"]
            / features["job_min_experience_years"],
            1.0,
        ),
        1.0,
    )

    return features


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    required_columns = [
        "candidate_id",
        "candidate_skills",
        "candidate_experience_years",
        "candidate_location",
        "job_id",
        "job_title",
        "job_description",
        "job_required_skills",
        "job_min_experience_years",
        "job_location",
        "job_type",
        "applied_label",
    ]
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing columns in Dataset.csv: {missing_columns}")

    X = build_features(df)
    y = (
        pd.to_numeric(df["applied_label"], errors="coerce")
        .fillna(0)
        .astype(int)
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = LogisticRegression(max_iter=300, class_weight="balanced")
    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)[:, 1]
    predictions = (probabilities >= 0.5).astype(int)

    auc_score = roc_auc_score(y_test, probabilities)
    cls_report = classification_report(y_test, predictions, output_dict=True)

    model_path = os.path.join(ARTIFACT_DIR, "recommender_model.pkl")
    feature_path = os.path.join(ARTIFACT_DIR, "feature_columns.json")
    metrics_path = os.path.join(ARTIFACT_DIR, "metrics.json")

    joblib.dump(model, model_path)
    with open(feature_path, "w", encoding="utf-8") as file:
        json.dump(list(X.columns), file, indent=2)

    with open(metrics_path, "w", encoding="utf-8") as file:
        json.dump({"auc": auc_score, "classification_report": cls_report}, file, indent=2)

    print(f"AUC: {auc_score:.4f}")
    print(f"Saved model: {model_path}")
    print(f"Saved features: {feature_path}")
    print(f"Saved metrics: {metrics_path}")


if __name__ == "__main__":
    main()
