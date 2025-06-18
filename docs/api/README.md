# API Reference Documentation

The QEC-SFT Platform provides a comprehensive REST API for integrating quantum-inspired semantic fault tolerance capabilities into your applications.

## 📖 Overview

The QEC-SFT API enables developers to:
- Submit Logical Semantic Units (LSUs) for analysis
- Generate governance policies and artifacts
- Perform semantic integrity validation
- Access AI-enhanced analysis capabilities
- Manage analysis history and results

## 🔐 Authentication

All API requests require authentication using API keys. See our [Authentication Guide](./authentication.md) for detailed setup instructions.

## 🌐 Base URL

```
Production: https://api.qec-sft.example.com/v1
Staging: https://staging-api.qec-sft.example.com/v1
```

## 📋 Endpoints

### Analysis Endpoints

#### Submit LSU for Analysis
```http
POST /analysis/submit
```

Submits a Logical Semantic Unit for comprehensive analysis.

**Request Body:**
```json
{
  "lsu": "All financial advice must be conservative and risk-averse",
  "options": {
    "aiEnhanced": true,
    "generateArtifacts": true,
    "includeRiskAssessment": true
  }
}
```

**Response:**
```json
{
  "analysisId": "analysis_123456789",
  "status": "processing",
  "estimatedCompletionTime": "2024-01-15T10:30:00Z",
  "webhookUrl": "https://your-app.com/webhook"
}
```

#### Get Analysis Results
```http
GET /analysis/{analysisId}
```

Retrieves the results of a completed analysis.

**Response:**
```json
{
  "analysisId": "analysis_123456789",
  "status": "completed",
  "result": {
    "payload": {
      "artifact_id": "artifact-uuid",
      "artifact_type": "rego_policy",
      "artifact_body": "package governance...",
      "representations": {
        "policy.rego": "package governance...",
        "specification.tla": "---- MODULE ...",
        "test_suite.py": "import pytest...",
        "documentation.md": "# Policy Documentation..."
      }
    },
    "certificate_of_semantic_integrity": {
      "status": "COHERENT",
      "coherence_score": 0.92,
      "syndrome_vector": [1, 1, 1, 1, 1],
      "risk_assessment": {
        "severity": "LOW",
        "impact_analysis": "All checks passed",
        "mitigation_strategy": "Continue monitoring"
      }
    }
  }
}
```

### Management Endpoints

#### List Analyses
```http
GET /analyses?limit=50&offset=0&status=completed
```

**Response:**
```json
{
  "analyses": [
    {
      "analysisId": "analysis_123456789",
      "lsu": "All financial advice must be conservative...",
      "status": "completed",
      "createdAt": "2024-01-15T09:00:00Z",
      "completedAt": "2024-01-15T09:02:30Z"
    }
  ],
  "total": 150,
  "hasMore": true
}
```

#### Delete Analysis
```http
DELETE /analysis/{analysisId}
```

**Response:**
```json
{
  "message": "Analysis deleted successfully",
  "deletedAt": "2024-01-15T10:35:00Z"
}
```

### AI Enhancement Endpoints

#### Check AI Service Status
```http
GET /ai/status
```

**Response:**
```json
{
  "available": true,
  "model": "nvidia/llama-3.1-nemotron-ultra-253b-v1",
  "confidence": 0.95,
  "lastHealthCheck": "2024-01-15T10:34:00Z"
}
```

#### Get AI Capabilities
```http
GET /ai/capabilities
```

**Response:**
```json
{
  "features": [
    "semantic_analysis",
    "security_assessment",
    "code_generation",
    "risk_evaluation"
  ],
  "supportedLanguages": ["rego", "tla+", "python", "markdown"],
  "maxTokens": 8193,
  "responseTime": "1-3 seconds"
}
```

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 429  | Rate Limited |
| 500  | Internal Server Error |
| 503  | Service Unavailable |

## 🔄 Webhooks

Configure webhooks to receive real-time notifications when analyses complete:

```json
{
  "event": "analysis.completed",
  "analysisId": "analysis_123456789",
  "status": "completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "result": {
    "coherence_score": 0.92,
    "status": "COHERENT"
  }
}
```

## 📝 SDK Examples

### JavaScript/TypeScript
```typescript
import { QecSftClient } from '@qec-sft/sdk';

const client = new QecSftClient({
  apiKey: process.env.QEC_SFT_API_KEY,
  baseUrl: 'https://api.qec-sft.example.com/v1'
});

// Submit analysis
const analysis = await client.submitAnalysis({
  lsu: "Ensure all data processing complies with GDPR requirements",
  options: { aiEnhanced: true }
});

// Wait for completion
const result = await client.waitForCompletion(analysis.analysisId);
console.log('Analysis completed:', result);
```

### Python
```python
from qec_sft import QecSftClient

client = QecSftClient(
    api_key=os.environ['QEC_SFT_API_KEY'],
    base_url='https://api.qec-sft.example.com/v1'
)

# Submit analysis
analysis = client.submit_analysis(
    lsu="All user data must be encrypted at rest and in transit",
    options={'ai_enhanced': True}
)

# Get results
result = client.get_analysis(analysis['analysisId'])
print(f"Status: {result['status']}")
```

### cURL
```bash
# Submit analysis
curl -X POST https://api.qec-sft.example.com/v1/analysis/submit \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "lsu": "All authentication must use multi-factor verification",
    "options": {"aiEnhanced": true}
  }'

# Get results
curl -X GET https://api.qec-sft.example.com/v1/analysis/analysis_123456789 \
  -H "Authorization: Bearer your-api-key"
```

## 📚 Next Steps

- [Authentication Setup](./authentication.md)
- [Code Examples](./examples.md)
- [Error Handling](./error-handling.md)
- [Rate Limiting](./rate-limiting.md)
- [Integration Tutorials](./tutorials.md)