# GitHub Repository Setup Instructions

Follow these steps to create a GitHub repository for this project:

## 1. Create a new GitHub repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "claude-seo-workflow")
4. Add a description (optional): "AI-powered SEO workflow system using Claude"
5. Choose visibility (Public or Private)
6. Do not initialize with README, .gitignore, or license (we'll push existing files)
7. Click "Create repository"

## 2. Initialize Git in your local project

```bash
# Navigate to your project directory
cd /path/to/claude-seo-project/claude-seo-workflow

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit of Claude SEO Workflow System"
```

## 3. Connect to GitHub and push

```bash
# Add the GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

Note: If your default branch is named "master" instead of "main", use:

```bash
git push -u origin master
```

## 4. Verify your repository

1. Refresh your GitHub repository page
2. You should see all your project files, including the README.md with screenshots

## Important Files to Include

Make sure the following files and directories are included in your repository:

- All Python code files (*.py)
- Templates directory
- Static directory with images
- README.md with screenshots
- Requirements.txt

## Sensitive Information

Ensure you don't push sensitive information to GitHub:

1. The API key should not be included in the repository
2. Check that the keys.json file is either:
   - Listed in .gitignore
   - Contains only placeholder values, not real API keys