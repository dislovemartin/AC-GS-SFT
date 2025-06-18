# QEC-SFT Platform Documentation

Welcome to the comprehensive documentation for the **QEC-SFT (Quantum-Inspired Semantic Fault Tolerance) Platform** - an advanced AI-powered governance policy generation and validation system.

## 📋 Table of Contents

### For API Users
- [API Reference Guide](./api/README.md)
- [Authentication & Security](./api/authentication.md)
- [Code Examples](./api/examples.md)
- [Error Handling](./api/error-handling.md)
- [Rate Limiting](./api/rate-limiting.md)
- [Integration Tutorials](./api/tutorials.md)

### For MCP (Management Control Panel) Users
- [Getting Started Guide](./mcp/getting-started.md)
- [User Interface Guide](./mcp/interface-guide.md)
- [Feature Documentation](./mcp/features.md)
- [Troubleshooting](./mcp/troubleshooting.md)
- [Best Practices](./mcp/best-practices.md)
- [Video Tutorials](./mcp/video-tutorials.md)

### General Resources
- [Frequently Asked Questions](./general/faq.md)
- [System Architecture](./general/architecture.md)
- [Security Guidelines](./general/security.md)
- [Changelog](./general/changelog.md)
- [Support Contact](./general/support.md)

## 🚀 Quick Start

### For Developers (API Integration)
```bash
# Install the SDK
npm install @qec-sft/sdk

# Basic usage
import { QecSftClient } from '@qec-sft/sdk';

const client = new QecSftClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.qec-sft.example.com'
});

// Analyze a governance requirement
const result = await client.analyzeRequirement({
  lsu: "All financial transactions must be approved by authorized personnel"
});
```

### For End Users (Web Interface)
1. Navigate to the [QEC-SFT Platform](https://qec-sft.example.com)
2. Enter your governance requirement in the LSU input field
3. Toggle AI-Enhanced Mode for advanced analysis
4. Click "Execute QEC-SFT Pipeline"
5. Review the generated certificate and artifacts

## 🔗 Quick Links

- **Live Demo**: [https://qec-sft.example.com](https://qec-sft.example.com)
- **API Playground**: [https://api.qec-sft.example.com/playground](https://api.qec-sft.example.com/playground)
- **GitHub Repository**: [https://github.com/qec-sft/platform](https://github.com/qec-sft/platform)
- **Support Portal**: [https://support.qec-sft.example.com](https://support.qec-sft.example.com)
- **Community Discord**: [https://discord.gg/qec-sft](https://discord.gg/qec-sft)

## 📞 Getting Help

- **Documentation Issues**: [Create an issue](https://github.com/qec-sft/docs/issues)
- **Technical Support**: support@qec-sft.example.com
- **Sales Inquiries**: sales@qec-sft.example.com
- **Community Forum**: [discussions.qec-sft.example.com](https://discussions.qec-sft.example.com)