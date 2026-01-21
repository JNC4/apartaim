#!/usr/bin/env python3
"""
Find anomalous conversation results where belief shifts are opposite to expected direction.

Anomalies:
1. control_helpful with negative normalized_belief_delta (expected positive - towards truth)
2. control_manipulative with positive normalized_belief_delta (expected negative - away from truth)
3. truthbot_helpful with negative normalized_belief_delta (expected positive - towards truth)
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Find the results directory with the most data
results_dir = Path("/home/juliusc/dev/projects/directories/misc/apartaim/data/results")

# Find directories with data files (not just experiment_summary.json)
result_dirs = []
for d in results_dir.iterdir():
    if d.is_dir():
        file_count = len(list(d.glob("*.json")))
        if file_count > 10:  # Has meaningful data
            result_dirs.append((d, file_count))

result_dirs.sort(key=lambda x: x[1], reverse=True)

# Use directory with most data (or specific one with d7dd5a0e example)
# The 20260112_102345 directory has the d7dd5a0e example
latest_dir = Path("/home/juliusc/dev/projects/directories/misc/apartaim/data/results/20260112_102345")
print(f"Using results from: {latest_dir}")

# Collect anomalies
anomalies = {
    "control_helpful_negative": [],  # Expected positive, got negative
    "control_manipulative_positive": [],  # Expected negative, got positive
    "truthbot_helpful_negative": [],  # Expected positive, got negative
}

# Process each conversation file
for json_file in latest_dir.glob("*.json"):
    if json_file.name == "experiment_summary.json":
        continue

    try:
        with open(json_file, 'r') as f:
            conv = json.load(f)

        condition = conv.get("condition", "")
        normalized_delta = conv.get("normalized_belief_delta", 0)

        # Check for anomalies
        if condition == "control_helpful" and normalized_delta < 0:
            anomalies["control_helpful_negative"].append({
                "conversation_id": conv["conversation_id"],
                "proposition": conv.get("proposition", ""),
                "proposition_id": conv.get("proposition_id", ""),
                "normalized_belief_delta": normalized_delta,
                "belief_before": conv.get("belief_before"),
                "belief_after": conv.get("belief_after"),
                "ground_truth_direction": conv.get("ground_truth_direction", ""),
                "file_path": str(json_file),
            })
        elif condition == "control_manipulative" and normalized_delta > 0:
            anomalies["control_manipulative_positive"].append({
                "conversation_id": conv["conversation_id"],
                "proposition": conv.get("proposition", ""),
                "proposition_id": conv.get("proposition_id", ""),
                "normalized_belief_delta": normalized_delta,
                "belief_before": conv.get("belief_before"),
                "belief_after": conv.get("belief_after"),
                "ground_truth_direction": conv.get("ground_truth_direction", ""),
                "file_path": str(json_file),
            })
        elif condition == "truthbot_helpful" and normalized_delta < 0:
            anomalies["truthbot_helpful_negative"].append({
                "conversation_id": conv["conversation_id"],
                "proposition": conv.get("proposition", ""),
                "proposition_id": conv.get("proposition_id", ""),
                "normalized_belief_delta": normalized_delta,
                "belief_before": conv.get("belief_before"),
                "belief_after": conv.get("belief_after"),
                "ground_truth_direction": conv.get("ground_truth_direction", ""),
                "file_path": str(json_file),
            })
    except Exception as e:
        print(f"Error processing {json_file}: {e}")

# Sort by absolute magnitude of delta (most extreme first)
for key in anomalies:
    anomalies[key].sort(key=lambda x: abs(x["normalized_belief_delta"]), reverse=True)

# Print summary
print("\n" + "="*80)
print("ANOMALY SUMMARY")
print("="*80)

for category, items in anomalies.items():
    print(f"\n{category}: {len(items)} cases")

# Save detailed results
output_file = Path("/home/juliusc/dev/projects/directories/misc/apartaim/data/analysis/anomalies.json")
output_file.parent.mkdir(parents=True, exist_ok=True)

with open(output_file, 'w') as f:
    json.dump(anomalies, f, indent=2)

print(f"\nDetailed results saved to: {output_file}")

# Print first 50 of each category
print("\n" + "="*80)
print("FIRST 50 OF EACH CATEGORY")
print("="*80)

for category, items in anomalies.items():
    print(f"\n\n### {category.upper()} (showing up to 50) ###\n")
    for i, item in enumerate(items[:50]):
        print(f"{i+1}. {item['conversation_id'][:8]}")
        print(f"   Proposition: {item['proposition'][:60]}...")
        print(f"   Normalized Delta: {item['normalized_belief_delta']}")
        print(f"   Belief: {item['belief_before']} -> {item['belief_after']}")
        print(f"   Ground Truth Dir: {item['ground_truth_direction']}")
        print()
