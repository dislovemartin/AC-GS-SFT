# vLLM Integration with QEC-SFT Platform

This document explains how to use the vLLM integration with MiniCPM4 model in your QEC-SFT Platform.

## Quick Start

### 1. Start vLLM Server

**Option A: Using the provided script**
```bash
./start-vllm.sh
```

**Option B: Manual start**
```bash
pip install vllm
vllm serve "openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu"
```

**Option C: Docker (GPU required)**
```bash
docker run --runtime nvidia --gpus all \
    --name qec_vllm \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu
```

### 2. Test Server Health

```bash
curl http://localhost:8000/health
```

### 3. Use AI-Enhanced Mode

1. Open the QEC-SFT Platform in your browser
2. Toggle "AI-Enhanced Mode" switch
3. Enter your Logical Semantic Unit (LSU)
4. Click "Execute QEC-SFT Pipeline"

## Features

### AI-Enhanced Pipeline

When AI mode is enabled, the platform uses vLLM with MiniCPM4 to:

- **Generate Real Code**: Creates actual Rego policies, TLA+ specifications, Python tests, and documentation
- **Semantic Analysis**: Performs sophisticated cross-representation consistency analysis
- **Security Analysis**: Conducts real security vulnerability assessment
- **Enhanced Certification**: Provides AI-powered semantic fault detection

### Fallback Mode

If vLLM server is unavailable, the platform automatically falls back to simulation mode while maintaining full functionality.

## Hardware Requirements

### Minimum Requirements
- **VRAM**: 8GB (for MiniCPM4-8B model)
- **RAM**: 16GB system memory
- **Storage**: 20GB free space for model download

### Your Hardware (Optimal)
- **VRAM**: 20GB ✅ (More than sufficient)
- **RAM**: 128GB ✅ (Excellent headroom)
- **Performance**: Should achieve ~20-50 tokens/second

## API Usage

The vLLM client provides these methods:

```typescript
// Generate specific representation types
await vllmClient.generateRepresentation(lsu, 'rego');
await vllmClient.generateRepresentation(lsu, 'tla');
await vllmClient.generateRepresentation(lsu, 'python');
await vllmClient.generateRepresentation(lsu, 'markdown');

// Analyze semantic consistency
await vllmClient.analyzeSemanticConsistency(lsu, representations);

// Perform security analysis
await vllmClient.performSecurityAnalysis(representations);

// Check server health
await vllmClient.isServerHealthy();
```

## Configuration

### Model Parameters
- **Temperature**: 0.3 (code generation), 0.7 (general tasks)
- **Max Tokens**: 1024-2048 depending on task
- **Top P**: 0.9
- **Model**: MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu

### Server Settings
- **Host**: localhost
- **Port**: 8000
- **Max Model Length**: 8192 tokens
- **GPU Memory Utilization**: 80%

## Troubleshooting

### Common Issues

1. **Server not starting**: Check GPU memory availability
2. **Model download fails**: Verify internet connection and Hugging Face access
3. **Out of memory**: Reduce `--gpu-memory-utilization` to 0.6 or 0.4
4. **Slow performance**: Ensure GPU drivers are updated

### Performance Optimization

1. **GPU Utilization**: Monitor with `nvidia-smi` during inference
2. **Batch Size**: Adjust based on available VRAM
3. **Model Precision**: Consider using quantized models for faster inference

## Integration Details

### Architecture
```
QEC-SFT Platform ↔ vLLM Client ↔ vLLM Server ↔ MiniCPM4 Model
```

### Data Flow
1. User submits LSU through UI
2. Enhanced QEC engine calls vLLM client
3. Client sends structured prompts to vLLM server
4. MiniCPM4 model generates responses
5. Responses are processed and integrated into semantic syndrome
6. Certificate of Semantic Integrity is generated with AI insights

## Advanced Usage

### Custom Prompts
Modify `src/services/vllm-client.ts` to customize system prompts for different representation types.

### Model Switching
Change the model name in the vLLM client constructor to use different models:
```typescript
const vllmClient = new VLLMClient('http://localhost:8000', 'your-custom-model');
```

### Performance Monitoring
The platform tracks:
- AI vs Simulation mode usage
- Processing times
- Success rates
- Error patterns

## Security Considerations

- vLLM server runs locally (no data sent to external services)
- All AI processing happens on your hardware
- Generated code should still be reviewed before production use
- Security analysis is AI-assisted but not definitive

## Next Steps

1. Start the vLLM server using the provided instructions
2. Enable AI-Enhanced Mode in the platform
3. Submit test LSUs to verify integration
4. Monitor performance and adjust settings as needed
5. Integrate with your governance workflows

For questions or issues, refer to the vLLM documentation or raise an issue in the project repository.