# Identity and Access Management

Learn how to configure user authentication, authorization, and access controls for Claude Code in your organization.

## Authentication methods

Setting up Claude Code requires access to Anthropic models. For teams, you can set up Claude Code access in one of three ways:

- Anthropic API via the Anthropic Console
- Amazon Bedrock
- Google Vertex AI

### Anthropic API authentication

**To set up Claude Code access for your team via Anthropic API:**

1. Use your existing Anthropic Console account or create a new Anthropic Console account
2. You can add users through either method below:
   - Bulk invite users from within the Console (Console -> Settings -> Members -> Invite)
   - [Set up SSO](https://support.anthropic.com/en/articles/10280258-setting-up-single-sign-on-on-the-api-console)
3. When inviting users, they need one of the following roles:
   - "Claude Code" role means users can only create Claude Code API keys
   - "Developer" role means users can create any kind of API key
4. Each invited user needs to complete these steps:
   - Accept the Console invite
   - [Check system requirements](/en/docs/claude-code/setup#system-requirements)
   - [Install Claude Code](/en/docs/claude-code/setup#installation)
   - Login with Console account credentials

### Cloud provider authentication

**To set up Claude Code access for your team via Bedrock or Vertex:**

1. Follow the [Bedrock docs](/en/docs/claude-code/amazon-bedrock) or [Vertex docs](/en/docs/claude-code/google-vertex-ai)
2. Distribute the environment variables and instructions for generating cloud credentials to your users. Read more about how to [manage configuration here](/en/docs/claude-code/settings).
3. Users can [install Claude Code](/en/docs/claude-code/setup#installation)

## Access control and permissions

We support fine-grained permissions so that you're able to specify exactly what the agent is allowed to do (e.g. run tests, run l