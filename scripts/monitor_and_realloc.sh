#!/bin/bash
# Monitor Hermes completion and prepare GPU reallocation

# Run IDs for resuming
QWEN_RUN="20260112_014247"
HERMES_RUN="20260112_014248"
GPTOSS_RUN="20260112_014249"

echo "=== Monitoring experiment progress ==="
echo "Run IDs:"
echo "  Qwen:   $QWEN_RUN"
echo "  Hermes: $HERMES_RUN"
echo "  GPT-OSS: $GPTOSS_RUN"
echo ""

check_progress() {
    echo "--- Progress at $(date) ---"
    for log in logs/single-*.log; do
        name=$(basename $log .log)
        completed=$(grep -c "Conversation complete" $log 2>/dev/null || echo 0)
        echo "$name: $completed / 3000 conversations"
    done
    echo ""
}

# Check if Hermes is done (3000 conversations)
wait_for_hermes() {
    while true; do
        check_progress
        hermes_done=$(grep -c "Conversation complete" logs/single-hermes.log 2>/dev/null || echo 0)
        if [ "$hermes_done" -ge 3000 ]; then
            echo "=== HERMES COMPLETE! ==="
            break
        fi
        echo "Waiting... (checking again in 5 minutes)"
        sleep 300
    done
}

echo "Checking progress every 5 minutes..."
echo "When Hermes completes, you'll need to:"
echo ""
echo "=== ON LAMBDA (ubuntu@192-222-53-19) ==="
echo ""
echo "# 1. Kill old vLLM servers"
echo "pkill -f vllm"
echo ""
echo "# 2. Start Qwen with 3 GPUs (port 8000)"
echo "CUDA_VISIBLE_DEVICES=0,1,2 nohup python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen3-32B --host 0.0.0.0 --port 8000 --tensor-parallel-size 3 --max-model-len 8192 > qwen.log 2>&1 &"
echo ""
echo "# 3. Start GPT-OSS with 4 GPUs (port 8001)"
echo "CUDA_VISIBLE_DEVICES=3,4,5,6 nohup python -m vllm.entrypoints.openai.api_server --model openai/gpt-oss-120b --host 0.0.0.0 --port 8001 --tensor-parallel-size 4 --max-model-len 4096 > gptoss.log 2>&1 &"
echo ""
echo "# 4. Wait for servers to start"
echo "tail -f qwen.log  # wait for 'Uvicorn running'"
echo "tail -f gptoss.log"
echo ""
echo "=== ON LOCAL MACHINE ==="
echo ""
echo "# 5. Kill current experiment processes"
echo "pkill -f 'run_experiment.py'"
echo ""
echo "# 6. Resume experiments with more GPU power"
echo "nohup python scripts/run_experiment.py --scenario single-qwen --concurrency 50 --resume $QWEN_RUN > logs/single-qwen-resumed.log 2>&1 &"
echo "nohup python scripts/run_experiment.py --scenario single-gptoss --concurrency 50 --resume $GPTOSS_RUN > logs/single-gptoss-resumed.log 2>&1 &"
echo ""
echo "========================================="
echo ""

# Start monitoring
wait_for_hermes

echo ""
echo "=== HERMES FINISHED! Time to reallocate GPUs ==="
echo "Follow the instructions above."
