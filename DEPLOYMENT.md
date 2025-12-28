# Frontend Deployment Guide (Vercel)

## Prerequisites
1. Vercel account
2. GitHub repository connected
3. Backend API URL

## Deployment Steps

### 1. Connect Repository
- Go to Vercel dashboard
- Click "Add New" → "Project"
- Import your GitHub repository
- Select the `frontend` folder as the root directory

### 2. Configure Project
- **Framework Preset**: Vite
- **Root Directory**: frontend
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3. Environment Variables
Add the following environment variable in Vercel dashboard:

**Required:**
- `VITE_BACKEND_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com`)

**How to add:**
1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Click **Add New**
4. Name: `VITE_BACKEND_URL`
5. Value: Your backend URL (e.g., `https://your-backend.onrender.com`)
6. Select environments: Production, Preview, Development (or as needed)
7. Click **Save**

**Optional:**
- Add any other `VITE_*` prefixed environment variables your app needs

**Note:** Do NOT use `@secret-name` syntax in `vercel.json` unless you've created the secret in Vercel dashboard first. Instead, set environment variables directly in the Vercel dashboard.

### 4. Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your application
- Your app will be available at: `https://your-app.vercel.app`

## Post-Deployment

### Update Backend CORS
After deploying, update your backend's `CORS_ORIGINS` environment variable to include your Vercel URL:
```
https://your-app.vercel.app,http://localhost:5173
```

### Custom Domain (Optional)
- Go to your project settings in Vercel
- Add your custom domain
- Follow DNS configuration instructions

## Features
- **Automatic HTTPS**: Vercel provides SSL certificates automatically
- **CDN**: Global CDN for fast asset delivery
- **Preview Deployments**: Every push creates a preview URL
- **Automatic Deployments**: Deploys on every push to main branch

## Notes
- The `vercel.json` file handles SPA routing (all routes redirect to index.html)
- Static assets are cached for optimal performance
- Environment variables are available at build time (prefixed with `VITE_`)

