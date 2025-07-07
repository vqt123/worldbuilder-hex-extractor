# Troubleshooting

Discover solutions to common issues with Claude Code installation and usage.

## Common installation issues

### Linux permission issues

When installing Claude Code with npm, you may encounter permission errors if your npm global prefix is not user writable (e.g. `/usr`, or `/usr/local`).

#### Recommended solution: Create a user-writable npm prefix

The safest approach is to configure npm to use a directory within your home folder:

```bash
# First, save a list of your existing global packages for later migration
npm list -g --depth=0 > ~/npm-global-packages.txt

# Create a directory for your global packages
mkdir -p ~/.npm-global

# Configure npm to use the new directory path
npm config set prefix ~/.npm-global

# Note: Replace ~/.bashrc with ~/.zshrc, ~/.profile, or other appropriate file for your shell
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Apply the new PATH setting
source ~/.bashrc

# Now reinstall Claude Code in the new location
npm install -g @anthropic-ai/claude-code

# Optional: Reinstall your previous global packages in the new location
# Look at ~/npm-global-packages.txt and install packages you want to keep
```

This solution is recommended because it:

- Avoids modifying system directory permissions
- Creates a clean, dedicated location for your global npm packages
- Follows security best practices

#### System Recovery: If you have run commands that change ownership and permissions of system files or similar

[Full system recovery instructions omitted for brevity]

## Auto-updater issues

If Claude Code can't update automatically, it may be due to permission issues with your npm global prefix directory. Follow the recommended solution above to fix this.

If you prefer to disable the auto-updater instead, you can set the `DISABLE_AUTOUPDATER` [environment variable](settings#environment-variables) to `1`.

## Permissions and authentication

### Repeated permission prompts

If you find yourself repeatedly approving the same commands, you can allow specific tools to run without approval using the `/permissions` command.

###