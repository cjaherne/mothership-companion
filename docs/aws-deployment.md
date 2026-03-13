# AWS Amplify Deployment

Host the Mothership Companion on AWS Amplify with HTTPS, WAF, and admin login.

## Prerequisites

- AWS account
- GitHub repo connected (or use Amplify Git connection)
- `main` branch as production

## 1. Create Amplify App

1. AWS Console → Amplify → New app → Host web app
2. Connect to **GitHub** → select `mothership-companion` repo
3. **Branch:** `main` (production branch; deploys to live URL)
4. Build settings: Amplify auto-detects `amplify.yml`
5. **Platform:** Choose **Next.js - SSR** (WEB_COMPUTE) so server-side rendering and API routes work

## 2. Environment Variables

In Amplify Console → App → Hosting → Environment variables, add:

| Variable | Value | Secret |
|----------|-------|--------|
| `OPENAI_API_KEY` | Your OpenAI key | Yes |
| `ADMIN_USERNAME` | `admin` | No |
| `ADMIN_PASSWORD` | Generated UUID or chosen password | Yes |
| `SESSION_SECRET` | 64-char hex (e.g. `openssl rand -hex 32`) | Yes |
| `REPLICATE_API_TOKEN` | Optional, for character art | Yes |

Mark sensitive values as **Secret** so they are not shown in logs.

## 3. Enable AWS WAF

1. Amplify Console → App → Hosting → Security
2. Enable **AWS WAF**
3. Use Amplify-recommended managed rules (SQL injection, XSS, rate-based)
4. Web ACL must be in **Global (CloudFront)** region

## 4. GitHub Auto-Deploy

When Amplify is connected to GitHub, a **webhook** is installed automatically:

- **Push to `main`** (including merges from PRs) → triggers build and deployment
- No extra configuration needed

Optional: Under Branch settings, enable **PR previews** for separate URLs per pull request.

## 5. URL

Amplify provides `https://main.<app-id>.amplifyapp.com`. No custom domain required.

## Login

- Username: `admin`
- Password: value of `ADMIN_PASSWORD` (from env or `npm run generate-admin-credentials` for local)
