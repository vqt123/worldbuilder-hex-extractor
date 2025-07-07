# Enterprise Deployment Overview

Learn how Claude Code can integrate with various third-party services and infrastructure to meet enterprise deployment requirements.

## Provider Comparison

| Feature | Anthropic | Amazon Bedrock | Google Vertex AI |
|---------|-----------|----------------|-----------------|
| Regions | Supported [countries](https://www.anthropic.com/supported-countries) | Multiple AWS [regions](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html) | Multiple GCP [regions](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations) |
| Prompt caching | Enabled by default | Enabled by default | Contact Google for enablement |
| Authentication | API key | AWS credentials (IAM) | GCP credentials (OAuth/Service Account) |
| Cost tracking | Dashboard | AWS Cost Explorer | GCP Billing |
| Enterprise features | Teams, usage monitoring | IAM policies, CloudTrail | IAM roles, Cloud Audit Logs |

## Cloud Providers

### Amazon Bedrock
Use Claude models through AWS infrastructure with IAM-based authentication and AWS-native monitoring.

### Google Vertex AI
Access Claude models via Google Cloud Platform with enterprise-grade security and compliance.

## Corporate Infrastructure

### Corporate Proxy
Configure Claude Code to work with your organization's proxy servers and SSL/TLS requirements.

### LLM Gateway
Deploy centralized model access with usage tracking, budgeting, and audit logging.

## Configuration Overview

Claude Code supports flexible configuration options that allow you to combine different providers and infrastructure.

### Using Bedrock with Corporate Proxy

```bash
# Enable Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Configure corporate proxy
export HTTPS_PROXY='https://proxy.example.com:8080'
```

### Using Vertex AI with LLM Gateway

```bash
# Enable Vertex
export CLAUDE_CODE_USE_VERTEX=1

# Configure LLM gateway
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex