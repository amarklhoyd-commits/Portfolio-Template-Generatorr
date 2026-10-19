# FolioVerse — Portfolio Template Generator

A beginner-friendly responsive portfolio builder using HTML, CSS, JavaScript, and optional Supabase authentication/database.

## Files
- `index.html` — pages and forms
- `style.css` — FolioVerse design system and responsive styling
- `app.js` — navigation, templates, preview, portfolio CRUD, optional Supabase
- `supabase.sql` — table and row-level security policies

## Run locally
1. Download and extract the ZIP.
2. Open the folder in Visual Studio Code.
3. Install the **Live Server** extension.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Explore the pages. Without Supabase keys, the app uses demo login and browser local storage. Demo mode is for UI testing only.

## Enable real online accounts and database
1. Create a project at https://supabase.com.
2. Open **SQL Editor**, paste `supabase.sql`, and run it.
3. In Supabase project settings, open API/Connect and copy the Project URL and anon/public key.
4. Open `app.js` and fill `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. Save and refresh. Test sign-up, log-in, create, edit, change template, and delete.
6. In Supabase Authentication settings, configure your site URL and redirect URLs for local testing and your deployed domain.
7. Never place a `service_role` key in browser JavaScript. The anon/public key is designed for frontend use when Row Level Security policies are enabled.

## Deploy to Vercel
1. Upload the project files to a GitHub repository.
2. In Vercel, import the repository.
3. For a plain HTML/CSS/JS project, use no build command and set the output directory to `.` (or leave framework preset as Other).
4. Deploy, then add your Vercel domain to Supabase Authentication's allowed site/redirect URLs.
5. Test the public website and cloud database.

## Features
- Consistent navigation: Home, Templates, Features, My Portfolio
- Login required before creating a portfolio
- Three distinct templates: Simple, Modern, Creative
- Portfolio creation, preview, edit, template switching, and delete
- Responsive layout
- Supabase Auth + Postgres CRUD integration when configured

## Notes
- Without Supabase configuration, demo login is simulated in this browser only; data is stored in local storage and is not cloud-synced.
- The profile picture field lets users choose an image file from their device (image formats, maximum 2 MB). The selected image is stored as a data URL with the portfolio record. For production deployments with many users, use Supabase Storage for profile images.
