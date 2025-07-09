#!/bin/bash
# Wrapper script to ensure workers-mcp runs with the correct Node.js version

# Use the specific Node.js v22.12.0 installation
/Users/janzunec/.nvm/versions/node/v22.12.0/bin/node \
  /Users/janzunec/Documents/GitHub/efp-mcp/node_modules/.bin/workers-mcp "$@"
