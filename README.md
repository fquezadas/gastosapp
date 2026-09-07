<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/25e8c948-146d-4e77-a947-6f6038e0ad4b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Google Login in Production

Set these variables in the deployment environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-public-domain.example
```

In Supabase, open **Authentication -> URL Configuration** and add the exact value of `VITE_APP_URL` to **Redirect URLs**. Also set the same domain as **Site URL**. Google OAuth will otherwise work locally but fail when the app is opened from a shared production link.
