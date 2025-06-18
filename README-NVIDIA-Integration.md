# NVIDIA API Integration with QEC-SFT Platform (Mistral Nemotron)

This document explains how to use the NVIDIA API integration with **Mistral Nemotron** for real AI-powered semantic fault tolerance analysis.

## Quick Start

### 1. Your API Configuration ✅

Your API credentials are already configured! Here's what you're using:

```bash
# API Endpoint (via Vite Proxy)
URL: /api/nvidia/v1/chat/completions

# Authentication
API Key: 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

# Model
Model: mistralai/mistral-nemotron

# Optimized Parameters
Temperature: 0.6
Top-P: 0.7
Max Tokens: 4096
```

### 2. Set Up Environment

Create your `.env` file with your specific configuration:

```bash
# Copy the example with your settings
cp .env.example .env
```

Your `.env` should contain:

```bash
VITE_NVIDIA_API_KEY=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
VITE_NVIDIA_BASE_URL=/api/nvidia/v1
VITE_NVIDIA_MODEL=mistralai/mistral-nemotron

# For Groq AI integration, get your API key from https://console.groq.com/keys
VITE_GROQ_API_KEY=your_actual_groq_api_key_here
```

**Important**: 
- The NVIDIA API uses a **proxy configuration** (`/api/nvidia/v1`) to avoid CORS issues
- Replace `your_actual_groq_api_key_here` with your real Groq API key from https://console.groq.com/keys

### 3. Start the Application

```bash
npm run dev
```

### 4. Use AI-Enhanced Mode

1. Open the QEC-SFT Platform in your browser
2. Toggle "AI-Enhanced Mode" switch (should show ready status)
3. Enter your Logical Semantic Unit (LSU)
4. Click "Execute QEC-SFT Pipeline"
5. Watch **Mistral Nemotron** generate and analyze your governance policies!

## 🤖 Mistral Nemotron Capabilities

**Mistral Nemotron** is specifically optimized for:

### **Superior Code Generation**
- **Rego Policies**: Production-ready with advanced security patterns
- **TLA+ Specifications**: Mathematically precise formal models
- **Python Tests**: Comprehensive pytest suites with edge cases
- **Documentation**: Clear, structured technical documentation

### **Advanced Analysis**
- **Semantic Consistency**: Deep cross-representation validation
- **Security Assessment**: Comprehensive vulnerability analysis
- **Root Cause Diagnosis**: Enhanced failure analysis with actionable insights
- **Business Logic Validation**: Context-aware requirement interpretation

### **Model Advantages**
- **Reasoning**: Superior logical reasoning and code understanding
- **Consistency**: More reliable output formatting and structure
- **Context**: Better handling of complex governance requirements
- **Performance**: Fast response times (1-3 seconds typical)

## 🔧 Technical Configuration

### Proxy Configuration

The application uses Vite proxy to avoid CORS issues:
- **Development URL**: `/api/nvidia/v1/chat/completions`
- **Proxied to**: `https://integrate.api.nvidia.com/v1/chat/completions`
- **Benefits**: No CORS issues, secure API key handling

### Optimal Parameters for Mistral Nemotron

```javascript
// Code Generation (Rego, TLA+, Python)
{
  temperature: 0.4,     // Precise and consistent
  top_p: 0.8,          // Balanced creativity
  max_tokens: 3000     // Comprehensive output
}

// Analysis Tasks (Semantic, Security)
{
  temperature: 0.3,     // Highly deterministic
  top_p: 0.8,          // Focused reasoning
  max_tokens: 1500     // Detailed analysis
}

// Documentation Generation
{
  temperature: 0.6,     // Natural language flow
  top_p: 0.7,          // Balanced expression
  max_tokens: 3000     // Comprehensive docs
}
```

### API Performance

With your configuration:
- **Response Time**: 1-3 seconds typical
- **Token Limit**: 4096 tokens per request
- **Rate Limits**: Check your NVIDIA dashboard
- **Availability**: 99.9% uptime (NVIDIA infrastructure)

## 🛡️ Security & Privacy

### Data Handling
- **No Storage**: NVIDIA doesn't store your governance requirements
- **Encryption**: All communications over HTTPS with Bearer token auth
- **Privacy**: Your LSUs are processed but not retained
- **Compliance**: NVIDIA's enterprise-grade security standards

### API Security
- **Authentication**: Bearer token with your unique API key
- **Rate Limiting**: Automatic throttling to prevent abuse
- **Monitoring**: Request logging available in NVIDIA dashboard
- **Fallback**: Graceful degradation to simulation mode if unavailable

## 📊 Testing Your Integration

### 1. Basic Test
Try this LSU to verify the integration:
```
"All financial transactions over $5,000 must require dual approval from authorized personnel."
```

### 2. Expected AI Output
You should see:
- **Rego Policy**: Complete with dual approval logic
- **TLA+ Spec**: Formal model with approval states
- **Python Tests**: Comprehensive test scenarios
- **Documentation**: Detailed implementation guide

### 3. Analysis Features
- **Semantic Consistency**: Should detect any logical inconsistencies
- **Security Analysis**: May identify access control considerations
- **Enhanced Diagnosis**: Provides actionable insights if issues found

## 🔧 Troubleshooting

### Common Issues

1. **"API key not configured"**
   ```bash
   # Verify your .env file
   cat .env | grep NVIDIA
   # Restart dev server
   npm run dev
   ```

2. **"NetworkError when attempting to fetch resource"**
   ```bash
   # Ensure you're using the proxy URL in .env
   VITE_NVIDIA_BASE_URL=/api/nvidia/v1
   # NOT the direct URL: https://integrate.api.nvidia.com/v1
   ```

3. **"Groq API Error: 401"**
   ```bash
   # Get your API key from https://console.groq.com/keys
   # Replace placeholder in .env with actual key
   VITE_GROQ_API_KEY=gsk_your_actual_key_here
   ```

4. **"Model not found"**
   - Verify `mistralai/mistral-nemotron` is available in your account
   - Check NVIDIA NGC for model access permissions

5. **Slow responses**
   - Normal for complex governance requirements (2-5 seconds)
   - Consider breaking down very complex LSUs

### Performance Optimization

1. **Monitor Token Usage**: Check your NVIDIA dashboard
2. **Optimize Prompts**: Shorter LSUs = faster responses
3. **Batch Testing**: Use simulation mode for rapid iteration
4. **Error Handling**: Platform auto-falls back to simulation

## 📈 Advanced Usage

### Custom Prompt Engineering

Modify `src/services/nvidia-client.ts` for domain-specific prompts:

```typescript
const systemPrompts = {
  rego: `You are a financial services compliance expert specializing in Rego policies...`,
  // Custom prompts for your domain
};
```

### Monitoring and Analytics

Track usage in your NVIDIA dashboard:
- **Request Volume**: Daily/monthly API calls
- **Token Consumption**: Input/output token usage
- **Error Rates**: Failed requests and reasons
- **Performance**: Average response times

### Integration with CI/CD

```bash
# Environment variable for production
export VITE_NVIDIA_API_KEY="your-production-key"
export VITE_NVIDIA_BASE_URL="/api/nvidia/v1"

# Build with AI support
npm run build

# Deploy with API key in environment
```

## 🚀 What's Next

1. **Get Groq API Key**: Visit https://console.groq.com/keys to get your API key
2. **Update .env**: Replace placeholder values with real API keys
3. **Test Integration**: Start with simple LSUs to verify functionality
4. **Explore Capabilities**: Try complex governance scenarios
5. **Monitor Usage**: Check your NVIDIA dashboard for analytics
6. **Production Deployment**: Configure environment variables for production
7. **Custom Workflows**: Integrate with your existing governance processes

Your QEC-SFT Platform now has **Mistral Nemotron** AI power! 🧠⚡

The platform is optimized for your specific API configuration and ready for production-grade governance policy generation and analysis.