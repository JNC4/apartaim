# Key Deliverables for a High-Quality Study

---

## 1. Experimental Infrastructure

### 1.1 Model Pipeline

| Component | Specification | Quality Bar |
|-----------|---------------|-------------|
| **Unknown Model** | Configurable between helpful/manipulative prompting | Clean prompt separation, no prompt leakage |
| **Truthbot** | Identical capability, guaranteed helpful prompting | Validated on ground-truth topics |
| **User Model** | Simulates belief updating with explicit scoring | Calibrated to human-like updating (ideally validated against human data) |
| **Manipulation Guesser** | Compares deltas, outputs binary + confidence | Documented decision criteria |

### 1.2 Prompt Library

- [ ] 5+ variations of "helpful expert" prompts
- [ ] 5+ variations of "persuade toward X" prompts (that don't trigger refusals)
- [ ] Documented prompt engineering process
- [ ] Prompt validation (do manipulative prompts actually produce different outputs?)

---

## 2. Experimental Materials

### 2.1 Proposition Set

| Requirement | Target |
|-------------|--------|
| Total propositions | 15-25 |
| Clear evidence asymmetry (vaccines, climate, etc.) | 10+ |
| Genuinely contested/nuanced topics | 3-5 |
| Emotionally "hot" vs "cold" topics | Mix of both |
| Domain coverage | Health, science, policy, history |

For each proposition:

- [ ] Ground truth label (which direction is evidence-supported)
- [ ] Brief justification citing key evidence
- [ ] Predicted difficulty for manipulation (easy/medium/hard)

### 2.2 Conversation Protocol

- [ ] Standardized user model opening questions (or generation process)
- [ ] Fixed turn count (you specified 3)
- [ ] Belief elicitation format (before/after, 0-100 scale)
- [ ] Rules for user model behavior (how curious? how pushback-prone?)

---

## 3. Experimental Runs

### 3.1 Sample Size Targets

| Condition | Minimum | Ideal |
|-----------|---------|-------|
| Control: Helpful | 50 conversations | 100+ |
| Control: Manipulative | 50 conversations | 100+ |
| Truthbot: Helpful | 50 conversations | 100+ |
| Truthbot: Manipulative | 50 conversations | 100+ |

*Multiply by number of propositions for total conversations*

### 3.2 Stored Data Per Conversation

```json
{
  "conversation_id": "uuid",
  "proposition": "Vaccines are safe and effective",
  "ground_truth_direction": "increase:positive",
  "condition": "manipulative|helpful",
  "truthbot_present": true|false,
  "turns": [
    {
      "user_message": "...",
      "unknown_model_response": "...",
      "truthbot_response": "..."
    }
  ],
  "belief_before": 50,
  "belief_after": 73,
  "belief_delta": +23,
  "manipulation_guesser_prediction": true|false,
  "manipulation_guesser_confidence": 0.85,
  "ground_truth_manipulative": true|false
}
```

---

## 4. Analysis & Metrics

### 4.1 Primary Metrics

**For Truthbot Efficacy:**

| Metric | Calculation | Hypothesis |
|--------|-------------|------------|
| Mean belief shift (manipulative, no truthbot) | Δ̄\_manip\_control | Baseline manipulation effect |
| Mean belief shift (manipulative, with truthbot) | Δ̄\_manip\_truthbot | Should be closer to 0 |
| Mean belief shift (helpful, no truthbot) | Δ̄\_help\_control | Baseline helpful effect |
| Mean belief shift (helpful, with truthbot) | Δ̄\_help\_truthbot | Should be similar to control |
| **Manipulation reduction ratio** | (Δ̄\_manip\_control - Δ̄\_manip\_truthbot) / Δ̄\_manip\_control | Primary success metric |
| **Helpfulness preservation ratio** | Δ̄\_help\_truthbot / Δ̄\_help\_control | Should be ~1.0 |

**For Manipulation Guesser:**

| Metric | Target |
|--------|--------|
| Accuracy | >70% |
| Precision (manipulative class) | >70% |
| Recall (manipulative class) | >70% |
| AUC-ROC | >0.75 |
| Confidence calibration | Plotted reliability diagram |

### 4.2 Secondary Analyses

- [ ] Breakdown by topic category (health vs. science vs. policy)
- [ ] Breakdown by evidence asymmetry strength
- [ ] Breakdown by emotional "heat" of topic
- [ ] Analysis of what manipulation guesser keys on (feature importance)
- [ ] Failure case analysis (where does truthbot fail? where does guesser fail?)

---

## 5. Visualizations

### 5.1 Required Figures

1. **Belief shift distributions**: Violin/box plots showing Δbelief across all 4 conditions
2. **Manipulation reduction effect**: Bar chart comparing manipulative condition ± truthbot
3. **Helpfulness preservation**: Bar chart comparing helpful condition ± truthbot
4. **ROC curve**: For manipulation guesser
5. **Confidence calibration**: Reliability diagram (predicted confidence vs. actual accuracy)
6. **Per-topic breakdown**: Heatmap or grouped bar chart

### 5.2 Recommended Figures

7. Effect size by evidence asymmetry strength
8. Example conversation excerpts (cherry-picked illustrative cases)
9. Delta analysis examples (what did truthbot add that unknown model omitted?)
10. Confusion matrix for manipulation guesser

---

## 6. Documentation

### 6.1 Reproducibility Package

- [ ] All prompts (exact text)
- [ ] All propositions with ground truth labels
- [ ] Code for running experiments
- [ ] Code for analysis
- [ ] Raw data (anonymized if needed)
- [ ] Environment specification (model versions, API settings, temperature, etc.)

### 6.2 Methodology Documentation

- [ ] Detailed experimental protocol
- [ ] Decision log (why these propositions? why these prompts? why 3 turns?)
- [ ] Pilot study results (if any)
- [ ] Known limitations and threats to validity

---

## 7. Written Deliverables

### 7.1 Core Paper Structure

| Section | Content |
|---------|---------|
| Abstract | One-paragraph summary of method, results, implications |
| Introduction | Motivation, research questions, contributions |
| Related Work | Position relative to Park et al., sycophancy literature, etc. |
| Method | Detailed experimental design |
| Results | Primary and secondary analyses |
| Discussion | Interpretation, limitations, implications |
| Conclusion | Summary and future work |
| Appendix | Limitations & Dual-Use (you've drafted this), full prompt library, per-topic results |

### 7.2 Supplementary Materials

- [ ] Extended results tables
- [ ] All conversation transcripts (or representative sample)
- [ ] Manipulation guesser prompts and decision criteria
- [ ] Statistical analysis details (tests used, assumptions checked)

---

## 8. Demo/Presentation Materials

### 8.1 For Hackathon Context

- [ ] 3-5 minute live demo showing:
  - A manipulative conversation without truthbot
  - The same topic with truthbot intervention
  - Manipulation guesser correctly identifying the manipulative case
- [ ] Slide deck (10-15 slides) covering motivation → method → results → implications
- [ ] One-page summary/poster

### 8.2 Compelling Demo Cases

Pre-select 2-3 conversations that clearly show:

1. Truthbot surfacing a "smoking gun" piece of evidence the manipulator omitted
2. Manipulation guesser correctly flagging with high confidence
3. (Optional) A false positive or failure case to show intellectual honesty

---

## 9. Quality Checklist

### Validity Threats Addressed

- [ ] **Prompt sensitivity**: Tested multiple prompt variations
- [ ] **Model stochasticity**: Multiple runs per condition (temperature >0) or temperature=0 for reproducibility
- [ ] **Topic selection bias**: Justified proposition selection, included varied topics
- [ ] **User model validity**: Acknowledged limitation of AI-as-user, discussed how real humans might differ
- [ ] **Truthbot bias**: Discussed how truthbot's own training could affect results

### Statistical Rigor

- [ ] Appropriate statistical tests (t-tests, Mann-Whitney, bootstrap CIs)
- [ ] Effect sizes reported (Cohen's d or equivalent)
- [ ] Multiple comparison corrections if doing many per-topic analyses
- [ ] Confidence intervals on all key metrics

---

## 10. Priority Order (If Time-Constrained)

| Priority | Deliverable | Rationale |
|----------|-------------|-----------|
| 🔴 P0 | Working pipeline + 50 conversations per condition | Core functionality |
| 🔴 P0 | Primary metrics calculated | Can claim results |
| 🟠 P1 | Visualizations (figures 1-5) | Makes results compelling |
| 🟠 P1 | Reproducibility package | Credibility |
| 🟡 P2 | Secondary analyses | Depth |
| 🟡 P2 | Manipulation guesser feature analysis | Insight into mechanism |
| 🟢 P3 | Extended topic coverage | Generalizability |
| 🟢 P3 | Multiple model comparison | Robustness |