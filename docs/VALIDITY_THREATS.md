# Validity Threats

This document describes known validity threats in the TruthBot AI manipulation detection study and mitigation strategies.

## User Model Validity

**Threat:** All belief-shift measurements depend on an AI simulating human belief updating. There is no validation against actual human data.

**Implications:**
- Belief deltas may not reflect how real humans would respond to the same manipulative or helpful content
- The user model may have systematic biases (e.g., too easily persuaded, too skeptical)
- Results should be interpreted as "how an AI user responds" not "how humans respond"

**Mitigations:**
1. **Demo app human belief logging** - The demo app includes optional human belief logging to collect comparison data
2. **Multiple temperature settings** - Test sensitivity to user model temperature
3. **Future validation** - Compare AI user responses to human participant data

**Remaining Risk:** Medium-High. Until validated against human data, findings are preliminary.

---

## Prompt Validity

**Threat:** Manipulative and helpful prompts may not actually produce the intended behavior in all models.

**Implications:**
- A model might refuse to execute manipulative prompts
- Helpful prompts might inadvertently be persuasive
- Different models may respond differently to the same prompts

**Mitigations:**
1. **Prompt validation script** (`scripts/validate_prompts.py`) - Generates sample outputs for manual review before experiments
2. **Multiple prompt variants** - Three variants per condition to reduce sensitivity to specific wording
3. **Stratified random assignment** - Ensures balanced variant distribution across conditions

**Remaining Risk:** Low-Medium. Validation script catches obvious issues but subtle prompt effects may remain.

---

## Ground Truth Validity

**Threat:** The "ground truth direction" for each proposition is researcher-assigned and may be contested.

**Implications:**
- What counts as "evidence-supported" may be debatable for some propositions
- Some propositions may have more nuanced evidence than a binary direction suggests

**Mitigations:**
1. **Clear criteria** - Ground truth based on scientific consensus where available
2. **Diverse propositions** - Include topics with varying certainty levels
3. **Normalized metrics** - Use normalized_belief_delta that accounts for direction

**Remaining Risk:** Low. Most propositions have clear scientific consensus.

---

## Measurement Validity

### Belief Score Parsing

**Threat:** The belief score parsing may fail or misinterpret user model responses.

**Mitigations:**
1. **Structured format** - User model prompted with explicit format markers (`<<<BELIEF>>>`)
2. **Parse method tracking** - Each score records how it was parsed (exact, original_format, fallback, failed)
3. **Logging** - Fallback and failed parses are logged for review

### Response Length Confound

**Threat:** Longer responses might be more persuasive regardless of content quality.

**Mitigations:**
1. **Response length tracking** - All response lengths are recorded and analyzed
2. **Per-condition analysis** - Length distributions compared across conditions
3. **Future work** - Could control for length in regression analysis

---

## External Validity

**Threat:** Results may not generalize to:
- Real-world interactions (multi-turn conversations, diverse topics)
- Different AI models
- Different user populations

**Mitigations:**
1. **Multi-model support** - Nine predefined scenarios for testing different model combinations
2. **Multi-turn conversations** - Three-turn conversations simulate more realistic interactions
3. **Diverse propositions** - 17 propositions across different domains

**Remaining Risk:** Medium. Single-model experiments should be interpreted cautiously.

---

## Statistical Validity

### Multiple Comparisons

**Threat:** Testing multiple hypotheses inflates false positive rate.

**Mitigations:**
1. **Bonferroni correction** - Applied to primary hypotheses
2. **Pre-registered hypotheses** - Clear distinction between primary and exploratory analyses
3. **Effect sizes** - Report Cohen's d with confidence intervals

### Power Analysis

**Threat:** Insufficient sample size may miss real effects.

**Recommendation:**
- Use power analysis to determine required sample size before full experiment
- Default 50 conversations per condition provides moderate power

---

## Reproducibility

**Threat:** Results may not be reproducible due to:
- Random variation in model outputs
- Software/API changes over time
- Undocumented configuration

**Mitigations:**
1. **Random seeds** - Experiments can specify seed for reproducibility
2. **Metadata logging** - Full configuration saved with each run
3. **Checkpoint recovery** - Interrupted experiments can be resumed
4. **Version tracking** - Model versions recorded in experiment metadata

---

## Recommended Pre-Experiment Checklist

1. [ ] Run `scripts/validate_prompts.py` and manually review outputs
2. [ ] Verify propositions have clear ground truth directions
3. [ ] Confirm model access and API stability
4. [ ] Run pilot with `--pilot` flag to check end-to-end flow
5. [ ] Review belief parse method distribution from pilot
6. [ ] Check response length distributions are reasonable
7. [ ] Document any deviations from standard protocol
