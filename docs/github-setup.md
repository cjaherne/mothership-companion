# GitHub Setup

## Create the Repository

Because GitHub CLI (`gh`) is not installed, create the repo manually:

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name:** `mothership-companion` (or your preferred name)
3. **Description:** Voice-interactive Mothership RPG companion app
4. **Visibility:** Private or Public
5. Do **not** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

## Connect and Push

After creating the repo, run (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd c:\Users\Chris\mothership-companion
git remote add origin https://github.com/YOUR_USERNAME/mothership-companion.git
git push -u origin main
```

## Optional: Install GitHub CLI

To create repos from the terminal in future:

```bash
winget install GitHub.cli --source winget
```

Then restart your terminal and run `gh auth login` to authenticate.
