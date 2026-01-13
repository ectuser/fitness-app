# GitHub Pages Deployment Instructions

Your fitness app is now configured for GitHub Pages deployment! Follow these steps:

## What I've Set Up

1. ✅ **Vite Configuration** - Added `base: '/fitness-app/'` to vite.config.ts
2. ✅ **GitHub Actions Workflow** - Created `.github/workflows/deploy.yml` for automatic deployment
3. ✅ **Build Configuration** - Added `.nojekyll` file to prevent Jekyll processing
4. ✅ **Production Build** - Tested and verified the build works correctly

## Steps to Deploy on GitHub

### 1. Push Your Code to GitHub

If you haven't already pushed to GitHub, run:

```bash
cd /Users/ivanmenshchikov/code/fitness-app/fitness-app
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

**Note:** If your default branch is `master` instead of `main`, update `.github/workflows/deploy.yml` line 5 to say `master` instead of `main`.

### 2. Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: `https://github.com/ivanmenshchikov/fitness-app`
2. Click on **Settings** (top navigation)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - Source: **GitHub Actions**
   (NOT "Deploy from a branch" - we're using GitHub Actions)
5. Click **Save**

### 3. Trigger the Deployment

The deployment will automatically trigger when you push to the main branch. You can also:

1. Go to the **Actions** tab in your repository
2. You should see a workflow called "Deploy to GitHub Pages"
3. If it hasn't run yet, click on it and click **Run workflow** manually

### 4. Wait for Deployment

- The deployment takes about 1-2 minutes
- You can watch the progress in the **Actions** tab
- Once complete, you'll see a green checkmark ✓

### 5. Access Your App

Your app will be live at:
```
https://ivanmenshchikov.github.io/fitness-app/
```

## Troubleshooting

### If the workflow fails:

1. **Check the Actions tab** for error messages
2. **Verify permissions**: Go to Settings → Actions → General
   - Scroll to "Workflow permissions"
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
   - Click Save

### If the app loads but shows a blank page:

1. Check the browser console (F12) for errors
2. Verify the `base` path in `vite.config.ts` matches your repo name
3. If your repo name is different from `fitness-app`, update line 7 in `vite.config.ts`:
   ```typescript
   base: '/your-repo-name/',
   ```

### If you need to redeploy:

Just push any changes to the main branch, and GitHub Actions will automatically rebuild and redeploy:

```bash
git add .
git commit -m "Update"
git push
```

## Local Development

Continue developing locally with:
```bash
npm run dev
```

The local dev server runs at `http://localhost:5173/` and is NOT affected by the GitHub Pages base path.

## Manual Deployment (Alternative)

If you prefer not to use GitHub Actions, you can deploy manually:

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
3. Run: `npm run deploy`

However, **GitHub Actions is recommended** as it's more reliable and automatic.

---

## Next Steps

Once deployed, test all features:
- ✓ Create workouts
- ✓ Start workout sessions
- ✓ Add/remove exercises
- ✓ Complete workouts
- ✓ View exercise statistics
- ✓ Check localStorage persistence (data survives page reload)

Enjoy your fitness app! 💪
