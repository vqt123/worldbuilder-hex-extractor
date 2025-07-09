#!/bin/bash

# Helper script to acknowledge operational guidelines compliance
# This creates the compliance file that the hook checks for

COMPLIANCE_FILE="/tmp/claude_session_compliance_$$"

echo "OPERATIONAL_GUIDELINES_ACKNOWLEDGED" > "$COMPLIANCE_FILE"
echo "✅ Operational guidelines compliance acknowledged for session $$"
echo "All tool calls are now enabled."