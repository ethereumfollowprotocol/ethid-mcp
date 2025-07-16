# Deployment Setup

This repository uses GitHub Actions to automatically deploy to Cloudflare Workers when code is pushed to the main branch.

## Required Secrets

You need to set up the following secret in your GitHub repository settings:

### CLOUDFLARE_API_TOKEN
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
- Click "Create Token"
- Use the "Custom token" template
- Set the following permissions:
  - `Account:Cloudflare Workers:Edit`
  - `Zone:Zone Settings:Read`
  - `Zone:Zone:Read`
- Set Account Resources to: `Include - All accounts`
- Set Zone Resources to: `Include - All zones`

**Note:** The account ID is already configured in `wrangler.json`, so you don't need to set it as a secret.

## Setting Up Secrets in GitHub

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Add the secret:
   - Name: `CLOUDFLARE_API_TOKEN`, Value: (your API token)

## Deployment Process

The workflow will:
1. Checkout the code
2. Set up Node.js 18
3. Install dependencies with `npm ci`
4. Run tests with `npm test`
5. Deploy to Cloudflare Workers using `npm run deploy`

## Manual Deployment

You can also trigger deployment manually:
1. Go to the "Actions" tab in your GitHub repository
2. Select "Deploy to Cloudflare Workers"
3. Click "Run workflow"
4. Select the branch and click "Run workflow"