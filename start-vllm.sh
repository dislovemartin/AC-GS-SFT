#!/bin/bash

# Start vLLM server with MiniCPM4 model
# This script starts the vLLM server for the QEC-SFT Platform

echo "🚀 Starting vLLM server with MiniCPM4 model..."
echo "Model: openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu"
echo "Server will be available at: http://localhost:8000"
echo ""

# Check if vLLM is installed
if ! command -v vllm &> /dev/null; then
    echo "❌ vLLM is not installed. Installing..."
    pip install vllm
fi

# Check GPU availability
if command -v nvidia-smi &> /dev/null; then
    echo "✅ GPU detected:"
    nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader,nounits
    echo ""
else
    echo "⚠️  No GPU detected. vLLM will use CPU (slower performance)"
    echo ""
fi

# Start the vLLM server
echo "🔄 Starting vLLM server..."
vllm serve "openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu" \
    --host 0.0.0.0 \
    --port 8000 \
    --trust-remote-code \
    --max-model-len 8192 \
    --gpu-memory-utilization 0.8

echo "🎉 vLLM server started successfully!"
echo "You can now use AI-Enhanced Mode in the QEC-SFT Platform"