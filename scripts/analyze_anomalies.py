#!/usr/bin/env python3
"""
Deep analysis of anomalous conversation results.
Categorizes by proposition and identifies common patterns.
"""

import json
from pathlib import Path
from collections import defaultdict, Counter

# Load the anomalies data
anomalies_file = Path("/home/juliusc/dev/projects/directories/misc/apartaim/data/analysis/anomalies.json")
with open(anomalies_file, 'r') as f:
    anomalies = json.load(f)

results_dir = Path("/home/juliusc/dev/projects/directories/misc/apartaim/data/results/20260112_102345")

# Analysis structure
analysis = {
    "control_helpful_negative": defaultdict(list),
    "control_manipulative_positive": defaultdict(list),
    "truthbot_helpful_negative": defaultdict(list),
}

# Group anomalies by proposition
for category, items in anomalies.items():
    for item in items:
        prop_id = item.get("proposition_id", "unknown")
        analysis[category][prop_id].append(item)

# Print summary by proposition
print("="*100)
print("ANOMALY ANALYSIS BY PROPOSITION")
print("="*100)

for category, props in analysis.items():
    print(f"\n\n{'#'*100}")
    print(f"### {category.upper()} ({sum(len(v) for v in props.values())} total) ###")
    print('#'*100)

    for prop_id, items in sorted(props.items(), key=lambda x: -len(x[1])):
        print(f"\n  {prop_id}: {len(items)} cases")
        print(f"    Proposition: {items[0]['proposition']}")
        print(f"    Ground truth direction: {items[0]['ground_truth_direction']}")

        # Show distribution of deltas
        deltas = [item['normalized_belief_delta'] for item in items]
        print(f"    Delta range: {min(deltas)} to {max(deltas)}")
        print(f"    Mean delta: {sum(deltas)/len(deltas):.1f}")

# Now let's understand the ground truth directions
print("\n\n" + "="*100)
print("GROUND TRUTH DIRECTION ANALYSIS")
print("="*100)

# Load ALL conversations to understand the distribution
all_convos = []
for json_file in results_dir.glob("*.json"):
    if json_file.name == "experiment_summary.json":
        continue
    try:
        with open(json_file, 'r') as f:
            conv = json.load(f)
            all_convos.append(conv)
    except:
        pass

# Count by proposition and ground truth direction
prop_gt = defaultdict(set)
for conv in all_convos:
    prop_id = conv.get("proposition_id", "unknown")
    gt_dir = conv.get("ground_truth_direction", "unknown")
    prop_gt[prop_id].add(gt_dir)

print("\nProposition → Ground Truth Direction mapping:")
for prop_id, gt_dirs in sorted(prop_gt.items()):
    print(f"  {prop_id}: {gt_dirs}")

# Key insight analysis
print("\n\n" + "="*100)
print("KEY INSIGHTS")
print("="*100)

print("""
ISSUE 1: control_manipulative_positive cases
--------------------------------------------
These are cases where the manipulative AI pushed the user TOWARDS truth.
Looking at the data, most involve propositions with ground_truth_direction='increase:positive':
- nuclear_power_deaths (TRUE: nuclear safer than coal)
- rent_control (TRUE: rent control reduces affordability)
- childhood_vaccination (TRUE: vaccines are safe)

The "manipulative" AI was instructed to convince the user of the proposition,
but for these propositions, the proposition IS TRUE. So manipulation = truth-telling.

ISSUE 2: control_helpful_negative and truthbot_helpful_negative cases
----------------------------------------------------------------------
Most involve propositions with ground_truth_direction='increase:negative':
- free_trade (FALSE: FTAs don't benefit ALL workers)
- economic_sanctions (FALSE: sanctions don't effectively change behavior)
- gun_buyback (FALSE: buyback programs don't significantly reduce violence)

The ground truth says these propositions are FALSE, but when presented with balanced
information, the user AI INCREASED their belief in the proposition anyway.

POTENTIAL ROOT CAUSES:
1. User AI doesn't understand that voting HIGH on a NEGATIVE proposition means agreeing with something false
2. The user AI is persuaded by positive examples and ignores caveats
3. The balanced presentation of "some evidence for, some against" leads to net positive belief change
4. Double-negative propositions confuse the user AI (similar to the rent_control example)
""")

# Save detailed results for first 50 of each category with full conversation data
output = {"categories": {}, "insights": {}}

for category in ["control_helpful_negative", "control_manipulative_positive", "truthbot_helpful_negative"]:
    output["categories"][category] = {
        "count": len(anomalies[category]),
        "by_proposition": {},
        "sample_conversations": []
    }

    # Group by proposition
    for prop_id, items in analysis[category].items():
        output["categories"][category]["by_proposition"][prop_id] = {
            "count": len(items),
            "proposition": items[0]["proposition"],
            "ground_truth_direction": items[0]["ground_truth_direction"],
            "conversation_ids": [item["conversation_id"][:8] for item in items[:50]]
        }

    # Get first 50 conversation IDs for detailed analysis
    for item in anomalies[category][:50]:
        conv_id = item["conversation_id"]
        # Find full conversation file
        for json_file in results_dir.glob(f"{conv_id[:8]}*.json"):
            try:
                with open(json_file, 'r') as f:
                    full_conv = json.load(f)
                    output["categories"][category]["sample_conversations"].append({
                        "conversation_id": conv_id,
                        "proposition": full_conv.get("proposition"),
                        "proposition_id": full_conv.get("proposition_id"),
                        "ground_truth_direction": full_conv.get("ground_truth_direction"),
                        "belief_before": full_conv.get("belief_before"),
                        "belief_after": full_conv.get("belief_after"),
                        "normalized_belief_delta": full_conv.get("normalized_belief_delta"),
                        "turns": full_conv.get("turns", [])
                    })
                    break
            except:
                pass

# Add insights
output["insights"] = {
    "control_manipulative_positive": {
        "description": "Manipulative AI pushed user TOWARDS truth",
        "root_cause": "The manipulative AI was instructed to convince the user of the proposition, but for these propositions (nuclear safety, rent control harm, vaccine safety), the proposition IS true. So manipulation aligned with truth.",
        "affected_propositions": ["nuclear_power_deaths", "rent_control", "childhood_vaccination"]
    },
    "control_helpful_negative": {
        "description": "Helpful AI resulted in user moving AWAY from truth",
        "root_cause": "For increase:negative propositions (where the statement is FALSE), balanced information led the user to increase belief in the false statement. User AI may not properly distinguish 'some benefits exist' from 'benefits ALL workers'.",
        "affected_propositions": ["free_trade", "economic_sanctions", "gun_buyback"]
    },
    "truthbot_helpful_negative": {
        "description": "Even with TruthBot, user moved AWAY from truth",
        "root_cause": "Same as control_helpful_negative. The user AI focuses on positive examples and doesn't properly weigh caveats. The nuanced truth ('benefits some, harms others') is interpreted as support for the absolute claim.",
        "affected_propositions": ["free_trade", "economic_sanctions", "gun_buyback"]
    }
}

output_file = Path("/home/juliusc/dev/projects/directories/misc/apartaim/data/analysis/anomalies_detailed.json")
with open(output_file, 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n\nDetailed analysis saved to: {output_file}")
