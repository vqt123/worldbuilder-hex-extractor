# Manage costs effectively

Claude Code consumes tokens for each interaction. The average cost is $6 per developer per day, with daily costs remaining below $12 for 90% of users.

For team usage, Claude Code charges by API token consumption. On average, Claude Code costs ~$50-60/developer per month with Sonnet 4 though there is large variance depending on how many instances users are running and whether they're using it in automation.

## Track your costs

- Use `/cost` to see current session usage
- **Anthropic Console users**:
  - Check [historical usage](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console) in the Anthropic Console (requires Admin or Billing role)
  - Set [workspace spend limits](https://support.anthropic.com/en/articles/9796807-creating-and-managing-workspaces) for the Claude Code workspace (requires Admin role)
- **Pro and Max plan users**: Usage is included in your subscription

## Managing costs for teams

When using Anthropic API, you can limit the total Claude Code workspace spend. To configure, [follow these instructions](https://support.anthropic.com/en/articles/9796807-creating-and-managing-workspaces). Admins can view cost and usage reporting by [following these instructions](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console).

On Bedrock and Vertex, Claude Code does not send metrics from your cloud. In order to get cost metrics, several large enterprises reported using [LiteLLM](/en/docs/claude-code/bedrock-vertex-proxies#litellm), which is an open-source tool that helps companies [track spend by key](https://docs.litellm.ai/docs/proxy/virtual_keys#tracking-spend). This project is unaffiliated with Anthropic and we have not audited its security.

## Reduce token usage

- **Compact conversations:**
  - Claude uses auto-compact by default when context exceeds 95% capacity
  - Toggle auto-compact: Run `/