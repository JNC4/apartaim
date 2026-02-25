# TruthBot

Framework for detecting and mitigating manipulative AI responses. Uses a second, truth-focused model to provide counterweight analysis alongside any AI response, letting users identify when they're being steered.

Poster presentation at [IASEAI 2026](https://www.iaseai.org/iaseai26).

## How it works

A simulated user asks a question about a controversial topic. An "unknown model" responds either helpfully or manipulatively (2x2 factorial design). TruthBot provides a parallel response focused on accuracy and balance. A "guesser" model then compares the two responses to predict whether manipulation occurred.

Four roles, all LLM-based:
- **Unknown Model** - the AI being evaluated (helpful or manipulative condition)
- **TruthBot** - truth-focused counterweight
- **User Model** - simulated user with belief tracking (0-100 scale)
- **Manipulation Guesser** - compares response deltas to detect intent

## Results

~18,000 conversations across 6 model configurations (Qwen 3 32B, Hermes 3 70B, GPT-OSS 120B, and multi-model variants). 15 propositions spanning health, science, policy, and history.

- Detection accuracy: 83-96% in 5 of 6 configurations
- Manipulation reduction: 30-71%
- Helpful responses preserved (TruthBot doesn't degrade non-manipulative interactions)

Full results and conversation browser: see the demo site or `docs/hackathon_report_phase1.md`.

## Repo structure

```
config/              experiment configuration and propositions
prompts/             system prompts for all model roles
orchestration/       experiment runner and batch manager
clients/             LLM API client (OpenAI-compatible)
models/              conversation data model
analysis/            statistical analysis and visualization code
scripts/             entry points (run_experiment.py, analyze_results.py, etc.)
data/results/        ~18K conversation transcripts (720MB)
data/analysis/       computed metrics and charts
docs/                paper
truthbot-demo/       Next.js demo site (deployed to Vercel)
```

## Running experiments

```bash
pip install -r requirements.txt
cp .env.example .env
# configure .env with your API endpoint and model

python scripts/run_experiment.py
python scripts/analyze_results.py
```

Expects an OpenAI-compatible API (tested with vLLM on Lambda Cloud).

## Demo site

```bash
cd truthbot-demo
npm install
npm run build
npm start
```

The demo site renders pre-computed data from `truthbot-demo/public/data/`. It doesn't call any external APIs.

## Acknowledgments

Thanks to [Lambda](https://lambda.ai/) and [Apart Research](https://www.apartresearch.com/) for $400 in compute credits that made the experiments possible.
