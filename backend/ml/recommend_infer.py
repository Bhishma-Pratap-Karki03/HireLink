import argparse
import json

import joblib
import numpy as np
import pandas as pd
from skill_aliases import canonicalize_skill


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


def build_feature_rows(candidate, jobs):
    candidate_skills = text_to_skill_set(candidate.get("skills_csv", ""))
    candidate_exp = float(candidate.get("experience_years", 0) or 0)
    candidate_loc = candidate.get("location", "")

    features = []
    metadata = []

    for job in jobs:
        required_skills = text_to_skill_set(job.get("required_skills_csv", ""))
        min_exp = float(job.get("min_experience_years", 0) or 0)
        job_loc = job.get("location", "")

        matched = sorted(list(candidate_skills.intersection(required_skills)))
        missing = sorted(list(required_skills - candidate_skills))

        overlap_count = len(matched)
        overlap_ratio = overlap_count / len(required_skills) if required_skills else 0.0
        location_match = (
            1
            if normalize(candidate_loc) == normalize(job_loc)
            and candidate_loc
            and job_loc
            else 0
        )
        experience_fit = min(candidate_exp / min_exp, 1.0) if min_exp > 0 else 1.0

        features.append(
            {
                "candidate_experience_years": candidate_exp,
                "job_min_experience_years": min_exp,
                "overlap_count": overlap_count,
                "overlap_ratio": overlap_ratio,
                "location_match": location_match,
                "experience_fit": experience_fit,
            }
        )

        metadata.append(
            {
                "jobId": job.get("jobId"),
                "jobTitle": job.get("jobTitle"),
                "companyName": job.get("companyName"),
                "companyLogo": job.get("companyLogo", ""),
                "location": job_loc,
                "jobType": job.get("jobType", ""),
                "workMode": job.get("workMode", ""),
                "requiredSkillsCount": len(required_skills),
                "matchedSkills": matched,
                "missingSkills": missing,
            }
        )

    return pd.DataFrame(features), metadata


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--features", required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--topk", type=int, default=10)
    args = parser.parse_args()

    model = joblib.load(args.model)
    with open(args.features, "r", encoding="utf-8") as file:
        feature_columns = json.load(file)

    with open(args.input, "r", encoding="utf-8") as file:
        payload = json.load(file)

    candidate = payload.get("candidate", {})
    jobs = payload.get("jobs", [])

    if not jobs:
        print(json.dumps({"recommendations": []}))
        return

    X, meta = build_feature_rows(candidate, jobs)
    X = X.reindex(columns=feature_columns, fill_value=0)

    probabilities = model.predict_proba(X)[:, 1]
    scores = np.round(probabilities * 100).astype(int)

    recommendations = []
    for index, item in enumerate(meta):
        matched_count = len(item["matchedSkills"])
        required_count = int(item.get("requiredSkillsCount", 0) or 0)
        skill_match_percent = (
            int(round((matched_count / required_count) * 100))
            if required_count > 0
            else 0
        )
        reasons = [f"Matched {matched_count} of {required_count} required skills"]
        recommendations.append(
            {
                **item,
                "score": int(scores[index]),
                "skillMatchPercent": skill_match_percent,
                "probability": float(probabilities[index]),
                "reasons": reasons,
            }
        )

    recommendations.sort(
        key=lambda row: (
            row.get("skillMatchPercent", 0),
            row.get("score", 0),
        ),
        reverse=True,
    )
    recommendations = recommendations[: args.topk]

    print(json.dumps({"recommendations": recommendations}, ensure_ascii=False))


if __name__ == "__main__":
    main()
