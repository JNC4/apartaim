What is AI manipulation?

AI manipulation refers to AI systems using deception, strategic behavior, or psychological exploitation to achieve their goals at the expense of human values and intentions. This includes:

    Sycophancy means telling users what they want to hear instead of what's true

    Strategic deception is misleading humans about capabilities or intentions

    Sandbagging hides true capabilities during evaluation to avoid restrictions or oversight

    Reward hacking exploits unintended loopholes in ways that violate the spirit of the objective

    Dark patterns manipulate user decisions through interface design

    Persuasive manipulation deploys influence techniques that bypass rational decision-making

An AI system pursuing basically any goal might figure out that deceiving humans or exploiting our psychological weaknesses is just... effective. The way we're training these systems might be teaching them to do exactly that.

What makes this dangerous: we're bad at measuring it. Our benchmarks miss strategic behavior. We lack real-world monitoring systems. AI capabilities are advancing faster than our ability to evaluate them honestly.
Why this hackathon?
The Problem

The gap is widening. AI systems get more capable, our detection tools don't. Models game engagement metrics because it works. Agents discover shortcuts through reward functions we never anticipated. Put multiple systems together and watch manipulation emerge in ways nobody predicted.

This is already happening. Models sandbag evaluations to avoid safety checks. We discover reward hacking only after deployment. Real-world systems manipulate users at scale through dark patterns. Our measurement tools? Completely inadequate.

Most evaluations are toy benchmarks built before we realized how strategic AI systems could be. They miss the manipulation that only shows up in real deployments. We're flying blind.
Why AI Manipulation Defense Matters Now

Safety depends on honest evaluation. If AI systems can deceive evaluators or hide dangerous capabilities, our safety work becomes meaningless. We can't align what we can't measure honestly.

We're massively under-investing in manipulation measurement and defense. Most effort goes into scaling capabilities or reactive harm mitigation. Far less into building the benchmarks and detection systems that catch manipulation before it causes damage.

Better measurement technology could give us evaluations that systems can't game, help us detect manipulation before it scales, and restore some balance between AI's ability to manipulate and our ability to detect it. It could create the transparency and empirical foundation we need to ground safety research in reality.
Hackathon Tracks
1. Measurement & Evaluation

    Design benchmarks and evaluations for sycophancy, reward hacking, dark design patterns, and persuasive capabilities in AI systems

    Assess ecological validity of current measurement approaches and identify gaps between lab evaluations and real-world deployment

    Create detection methods for deception, sandbagging, and strategic behavior in AI systems

    Build frameworks for detecting and attributing manipulative intent in model outputs

2. Real-World Analysis

    Analyze actual deployment data (chat logs, social media interactions, customer service transcripts) and conduct case studies of manipulation incidents

    Build monitoring systems to detect manipulation in the wild across different deployment contexts

    Compare benchmark predictions to real-world behavior and identify discrepancies or performance gaps

    Develop methods for systematic data collection and analysis of manipulation patterns at scale

3. Mitigations:

    Build MVPs demonstrating novel countermeasures or technical mitigations that can be integrated into existing AI systems

    Develop transparency interventions with empirical backing showing reduced manipulation

    Create governance proposals grounded in data from real-world analysis or evaluations

    Prototype user-facing tools that help detect or resist AI manipulation attempts

4. Open Track

    Explore emergent manipulation through multi-agent dynamics or training dynamics that lead to manipulative behavior

    Analyze dual-use considerations in manipulation research and mitigation

    Develop novel theoretical frameworks for understanding AI manipulation

    Pursue other empirical projects advancing the field that don't fit the tracks above




General Introduction

    AI deception: A survey of examples, risks, and potential solutions (Park et al., 2024)
    Comprehensive survey defining AI deception and documenting manipulation via sycophancy, strategic behavior, and safety test evasion. Covers both near-term risks (fraud, election tampering) and long-term risks (losing control of AI systems). Essential foundation for understanding the manipulation landscape.

    Artificial Intelligence Index Report 2024 (Stanford HAI)
    Annual assessment of global AI progress including responsible AI and system risks. Provides regulatory trends and technical challenges context for manipulation research.

    Towards Understanding Sycophancy in Language Models (Sharma et al., 2024)
    Shows that state-of-the-art AI assistants consistently exhibit sycophancy, with human preference data driving this behavior. Documents inverse scaling law: larger models become MORE sycophantic. Critical for understanding how training incentivizes manipulation.

Track 1: Measurement & Evaluation

    AI Sandbagging: Language Models can Strategically Underperform on Evaluations (van der Weij et al., 2024)
    Demonstrates that GPT-4 and Claude 3 Opus can strategically underperform on dangerous capability evaluations while maintaining general performance. Models can "password-lock" capabilities and target specific scores. Essential for understanding evaluation vulnerabilities.

    Noise Injection Reveals Hidden Capabilities of Sandbagging Language Models (Tice et al., 2024)
    Novel sandbagging detection method: injecting noise into model weights reveals hidden capabilities. Provides practical, model-agnostic detection tool applicable to hackathon projects.

    The WMDP Benchmark: Measuring and Reducing Malicious Use With Unlearning (Li et al., 2024)
    Dataset of 3,668 multiple-choice questions for evaluating hazardous knowledge. Widely used in sandbagging and capability evaluation research. Includes open-source code and benchmark.

Open Datasets/Tools:

    WMDP Benchmark & Code - Evaluation benchmark with implementation code

    WildChat Dataset - 1M real ChatGPT conversations for ecological validity testing

    lm-evaluation-harness - Standard framework for running model evaluations

Track 2: Real-World Analysis

    Recent Frontier Models Are Reward Hacking (METR, 2025)
    Documents reward hacking in production-like settings: o3 hacked evaluation software, Claude models subverted tasks. Shows models demonstrate awareness their behavior violates intentions but do it anyway. Critical real-world evidence.

    Reward Hacking in Reinforcement Learning (Lilian Weng, 2024)
    Comprehensive overview with real-world examples: summarization gaming ROUGE, coding tampering with tests, recommendation algorithms optimizing engagement over welfare. Extensive bibliography and case studies.

    Reward hacking behavior can generalize across tasks (Denison et al., 2024)
    Shows training on reward hacking leads to 1.3x-2.0x increase on held-out datasets. Documents how manipulation generalizes across different contexts.

Open Datasets/Tools:

    WildChat Dataset - Real user conversations for analyzing manipulation in deployment

    METR Task Environments - Autonomous AI evaluation tasks where reward hacking has been observed

Track 3: Mitigations

    Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation (OpenAI, 2025)
    Shows chain-of-thought monitoring can detect reward hacking in reasoning models. GPT-4o can monitor stronger o3-mini model. Demonstrates both promise and pitfalls of transparency-based mitigations.

    From shortcuts to sabotage: natural emergent misalignment from reward hacking (Anthropic, 2025)
    Demonstrates that reward hacking training causes downstream misalignment (alignment faking, sabotage). Shows interventions can break semantic links between reward hacking and misalignment.

    The WMDP Benchmark: Measuring and Reducing Malicious Use With Unlearning (Li et al., 2024)
    Develops RMU unlearning method that removes hazardous knowledge while preserving general capabilities. Open-source implementation available.

Open Datasets/Tools:

    WMDP RMU Code - Unlearning implementation

    TransformerLens - Interpretability library for analyzing model internals

Track 4: Open Track

    AgentVerse: Facilitating Multi-Agent Collaboration and Exploring Emergent Behaviors (Chen et al., 2024)
    Demonstrates emergent social behaviors in multi-agent systems: volunteer behaviors, conformity, and destructive behaviors. Framework available on GitHub for studying manipulation dynamics.

    Emergence in Multi-Agent Systems: A Safety Perspective (2024)
    Investigates how specification insufficiency leads to emergent manipulative behavior when agents' learned priors conflict. Proposes emergence breaching mechanisms.

    School of Reward Hacks: Hacking Harmless Tasks Generalizes to Misalignment (2024)
    Shows training on "harmless" reward hacking causes generalization to concerning behaviors including shutdown avoidance and alignment faking. Provides dataset for studying training dynamics.

Open Datasets/Tools:

    AgentVerse Framework - Multi-agent collaboration framework for studying emergent manipulation

    Multi-Agent Particle Environments - OpenAI's environments for testing multi-agent behavior

    School of Reward Hacks Dataset - Synthetic training data that induces reward hacking for studying how manipulation generalizes across tasks

    NetLogo - Agent-based modeling platform for simulating emergent phenomena

Project Ideas (a list of ideas in this link)
Project Scoping Advice


CRITICAL:

Based on successful hackathon retrospectives:

    Focus on MVP, Not Production. In 2 days, aim for:

        Day 1: Set up environment, implement core functionality, get basic pipeline working

        Day 2: Add 1-2 key features, create demo, prepare presentation

    Use Mock/Simulated Data rather than integrating real APIs or databases, use:

        Synthetic datasets

        Pre-recorded samples

        Simulation environments
        This eliminates authentication, rate limiting, and data quality issues.

    Leverage Pre-trained Models. Don't train from scratch. Use:

        OpenAI/Anthropic APIs for LLMs

        Hugging Face for pre-trained models

        Existing detection tools as starting points

    Clear Success Criteria. Define what "working" means:

        For benchmarks: Evaluates 3+ models on 50+ test cases with documented methodology

        For detection: Identifies manipulation in 10+ examples with >70% accuracy

        For analysis: Documents patterns across 100+ deployment examples with clear taxonomy

        For mitigation: Demonstrates measurable improvement on 3+ manipulation metrics