# Claude Code on Amazon Bedrock

Learn about configuring Claude Code through Amazon Bedrock, including setup, IAM configuration, and troubleshooting.

## Prerequisites

Before configuring Claude Code with Bedrock, ensure you have:

- An AWS account with Bedrock access enabled
- Access to desired Claude models (e.g., Claude Sonnet 4) in Bedrock
- AWS CLI installed and configured (optional - only needed if you don't have another mechanism for getting credentials)
- Appropriate IAM permissions

## Setup

### 1. Enable model access

First, ensure you have access to the required Claude models in your AWS account:

1. Navigate to the [Amazon Bedrock console](https://console.aws.amazon.com/bedrock/)
2. Go to **Model access** in the left navigation
3. Request access to desired Claude models (e.g., Claude Sonnet 4)
4. Wait for approval (usually instant for most regions)

### 2. Configure AWS credentials

Claude Code uses the default AWS SDK credential chain. Set up your credentials using one of these methods:

> Claude Code does not currently support dynamic credential management (such as automatically calling `aws sts assume-role`).

**Option A: AWS CLI configuration**

```bash
aws configure
```

**Option B: Environment variables (access key)**

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token
```

**Option C: Environment variables (SSO profile)**

```bash
aws sso login --profile=<your-profile-name>

export AWS_PROFILE=your-profile-name
```

### 3. Configure Claude Code

Set the following environment variables to enable Bedrock:

```bash
# Enable Bedrock integration
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1  # or your preferred region
```

> `AWS_REGION` is a required environment variable. Claude Code does not read from the `.aws` config file for this setting.