# Claude Code on Google Vertex AI

Learn about configuring Claude Code through Google Vertex AI, including setup, IAM configuration, and troubleshooting.

## Prerequisites

Before configuring Claude Code with Vertex AI, ensure you have:

- A Google Cloud Platform (GCP) account with billing enabled
- A GCP project with Vertex AI API enabled
- Access to desired Claude models (e.g., Claude Sonnet 4)
- Google Cloud SDK (`gcloud`) installed and configured
- Quota allocated in desired GCP region

> Vertex AI may not support the Claude Code default models on non-`us-east5` regions.

## Setup

### 1. Enable Vertex AI API

Enable the Vertex AI API in your GCP project:

```bash
# Set your project ID
gcloud config set project YOUR-PROJECT-ID

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

### 2. Request model access

Request access to Claude models in Vertex AI:

1. Navigate to the [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)
2. Search for "Claude" models
3. Request access to desired Claude models (e.g., Claude Sonnet 4)
4. Wait for approval (may take 24-48 hours)

### 3. Configure GCP credentials

Claude Code uses standard Google Cloud authentication.

### 4. Configure Claude Code

Set the following environment variables:

```bash
# Enable Vertex AI integration
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID

# Optional: Disable prompt caching if needed
export DISABLE_PROMPT_CACHING=1
```

### 5. Model configuration

Claude Code uses these default models for Vertex AI:

| Model type | Default value |
|-----------|--------------|
| Primary model | `claude-sonnet-4@20250514` |
| Small/fast model | `claude-3-5-haiku@20241