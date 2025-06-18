# Authentication & Authorization

The QEC-SFT API uses API keys for authentication and supports role-based access control for enterprise users.

## 🔐 API Key Authentication

### Obtaining an API Key

1. **Sign up** at [https://qec-sft.example.com/signup](https://qec-sft.example.com/signup)
2. **Verify your email** address
3. **Navigate** to the API Keys section in your dashboard
4. **Click "Generate New API Key"**
5. **Copy and store** your API key securely

### API Key Format

API keys follow this format:
```
qec_live_1234567890abcdef1234567890abcdef
qec_test_1234567890abcdef1234567890abcdef
```

- `qec_live_` prefix for production environment
- `qec_test_` prefix for testing environment

### Using API Keys

Include your API key in the `Authorization` header:

```http
Authorization: Bearer qec_live_1234567890abcdef1234567890abcdef
```

**Example with cURL:**
```bash
curl -X POST https://api.qec-sft.example.com/v1/analysis/submit \
  -H "Authorization: Bearer qec_live_1234567890abcdef1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{"lsu": "Sample requirement"}'
```

## 🏢 Enterprise Authentication

### OAuth 2.0 (Enterprise Only)

For enterprise customers, we support OAuth 2.0 with the following flows:
- **Client Credentials Flow** (machine-to-machine)
- **Authorization Code Flow** (user authentication)

#### Client Credentials Flow

```bash
# Get access token
curl -X POST https://auth.qec-sft.example.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=api"

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "api"
}

# Use access token
curl -X POST https://api.qec-sft.example.com/v1/analysis/submit \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"lsu": "Sample requirement"}'
```

### SAML SSO (Enterprise Only)

Enterprise customers can configure SAML Single Sign-On:

1. **Contact our sales team** at sales@qec-sft.example.com
2. **Provide your SAML metadata** URL or XML
3. **Configure user mappings** and roles
4. **Test the integration** in our staging environment

## 🛡️ Security Best Practices

### API Key Security

1. **Never commit API keys** to version control
2. **Use environment variables** to store keys
3. **Rotate keys regularly** (recommended: every 90 days)
4. **Use different keys** for different environments
5. **Monitor key usage** in your dashboard

### Environment Variables

```bash
# .env file
QEC_SFT_API_KEY=qec_live_1234567890abcdef1234567890abcdef
QEC_SFT_BASE_URL=https://api.qec-sft.example.com/v1

# Usage in Node.js
const apiKey = process.env.QEC_SFT_API_KEY;
```

### Key Rotation

```bash
# Generate new key
curl -X POST https://api.qec-sft.example.com/v1/keys \
  -H "Authorization: Bearer qec_live_old_key" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Production Key", "environment": "production"}'

# Revoke old key
curl -X DELETE https://api.qec-sft.example.com/v1/keys/qec_live_old_key \
  -H "Authorization: Bearer qec_live_new_key"
```

## 🔒 Permissions & Scopes

### Available Scopes

| Scope | Description |
|-------|-------------|
| `analysis:read` | Read analysis results |
| `analysis:write` | Submit new analyses |
| `analysis:delete` | Delete analyses |
| `ai:read` | Check AI service status |
| `webhooks:write` | Configure webhooks |
| `keys:manage` | Manage API keys |

### Scope Usage

```bash
# Request specific scopes
curl -X POST https://auth.qec-sft.example.com/oauth/token \
  -d "grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scope=analysis:read analysis:write"
```

## 🚨 Error Responses

### Authentication Errors

```json
// Missing API key
{
  "error": "authentication_required",
  "message": "API key is required",
  "code": 401
}

// Invalid API key
{
  "error": "invalid_api_key",
  "message": "The provided API key is invalid or expired",
  "code": 401
}

// Insufficient permissions
{
  "error": "insufficient_permissions",
  "message": "Your API key does not have permission to access this resource",
  "code": 403,
  "required_scope": "analysis:write"
}
```

## 📊 Monitoring & Analytics

### Usage Dashboard

Monitor your API usage at [https://dashboard.qec-sft.example.com](https://dashboard.qec-sft.example.com):

- **Request volume** and rate limits
- **Error rates** and status codes
- **Response times** and performance metrics
- **Cost tracking** and billing information

### API Key Analytics

```bash
# Get usage statistics
curl -X GET https://api.qec-sft.example.com/v1/keys/stats \
  -H "Authorization: Bearer qec_live_1234567890abcdef1234567890abcdef"

# Response
{
  "requests_this_month": 15420,
  "requests_today": 234,
  "rate_limit_remaining": 4766,
  "last_used": "2024-01-15T10:34:00Z"
}
```

## 🔧 Testing Authentication

### Test Endpoint

Use this endpoint to verify your authentication:

```bash
curl -X GET https://api.qec-sft.example.com/v1/auth/verify \
  -H "Authorization: Bearer qec_test_1234567890abcdef1234567890abcdef"

# Success response
{
  "authenticated": true,
  "key_id": "key_123456",
  "environment": "test",
  "scopes": ["analysis:read", "analysis:write"],
  "rate_limit": {
    "requests_per_minute": 100,
    "requests_per_hour": 5000
  }
}
```

## 📞 Getting Help

If you encounter authentication issues:

1. **Check our status page**: [https://status.qec-sft.example.com](https://status.qec-sft.example.com)
2. **Review your API key** in the dashboard
3. **Contact support**: support@qec-sft.example.com
4. **Join our community**: [Discord](https://discord.gg/qec-sft)

## 📚 Next Steps

- [API Reference](./README.md)
- [Code Examples](./examples.md)
- [Rate Limiting](./rate-limiting.md)
- [Error Handling](./error-handling.md)