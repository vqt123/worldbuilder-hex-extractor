#!/bin/bash

# PreToolUse hook to enforce operational guidelines compliance
# This hook blocks all tool calls until operational guidelines are acknowledged

COMPLIANCE_FILE="/tmp/claude_session_compliance_$$"

if ! grep -q "OPERATIONAL_GUIDELINES_ACKNOWLEDGED" "$COMPLIANCE_FILE" 2>/dev/null; then
    echo "🚫 BLOCKED: Must acknowledge operational guidelines compliance before any action"
    echo ""
    echo "REQUIRED: Check CLAUDE.md guidelines and acknowledge compliance by stating:"
    echo "\"OPERATIONAL GUIDELINES ACKNOWLEDGED\""
    echo ""
    echo "📋 See CLAUDE.md for complete operational guidelines and requirements"
    echo ""
    exit 1
fi

# If we get here, compliance has been acknowledged
echo "✅ Operational guidelines compliance verified"
exit 0