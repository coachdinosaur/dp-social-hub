# DP Social Hub

Social media planner for the **Digital Profits PH** channel: plan and track posts on YouTube, YouTube Shorts, TikTok, Instagram, Facebook and X, with captions, hashtags, best posting times, checklists and to-dos. Shared between the team through Supabase, hosted on GitHub Pages.

**Live:** https://coachdinosaur.github.io/dp-social-hub/

## What's in it
- **Dashboard**: this week at a glance, upcoming posts, things that need attention (overdue posts, missing results, checklists not done before posting), today's to-dos, goals (YouTube 3,000 subscribers and more).
- **Posts**: one record per platform post, with status (Idea → Draft → Ready → Scheduled → Posted), Philippine-time schedule, caption, hashtags, link, a checklist for that platform, and results (views, likes, comments, shares, saves, follows).
  - **Caption checker**: character and hashtag limits for each platform, Instagram's 125-character preview, links that won't be clickable, referral-disclosure reminder. One-tap **copy** of the ready-to-paste caption.
  - **Cross-post set**: one episode → a draft for every platform, each in its next best-time slot.
  - **Mark as posted** adds reminders to log results after 24 hours and 7 days.
- **Calendar**: week view (Monday–Sunday, Philippine time).
- **To-dos**: by person and due date, plus **Plan this week**, which adds the weekly rhythm (1 long video, 3 reels, community posts, replying to comments, logging results).
- **Hashtags**: reusable sets, usage and average views per hashtag.
- **Best times**: starting windows per platform for a Philippine audience, and **Insights**: a day × time heatmap from your own logged results.
- **Ideas**: viewer questions for future episodes, content ideas, and the best-commenters shortlist.
- **Settings**: episodes, goals, JSON backup / import, CSV export.

## Setup (once)

### 1. Supabase (free)
1. Sign up at https://supabase.com and create a project (region: Singapore). Save the database password somewhere safe.
2. **SQL Editor → New query**: paste [`supabase/schema.sql`](supabase/schema.sql), replace the two example emails with your and JB's emails, and **Run**.
3. **Authentication → URL Configuration**:
   - Site URL: `https://coachdinosaur.github.io/dp-social-hub/`
   - Redirect URLs: add `https://coachdinosaur.github.io/dp-social-hub/` and `http://localhost:5173/dp-social-hub/`
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key.

### 2. GitHub
In this repo: **Settings → Secrets and variables → Actions → Variables**, add:
- `VITE_SUPABASE_URL` = the Project URL
- `VITE_SUPABASE_ANON_KEY` = the anon public key

Then **Actions → Deploy to GitHub Pages → Run workflow** (or push to `main`).

The anon key is meant to be public. Row Level Security lets only the emails in `members` see or change data.

### 3. First sign-in
Open the site, enter your email, and click the link in the email. Then go to **Settings → Load starter data** once to load the hashtag sets, goals, questions and to-dos.

To add someone later: `insert into public.members (email, name) values ('them@gmail.com', 'Name');` in the SQL Editor.

## Development
```bash
npm install
npm run dev        # http://localhost:5173/dp-social-hub/ (demo mode: browser storage)
```
To use Supabase locally, create `.env.local` with `VITE_SUPABASE_URL=…` and `VITE_SUPABASE_ANON_KEY=…`.

Without those variables the app runs in **demo mode**: everything is saved in the browser only.

Note: Supabase pauses free projects after about a week with no activity. Open the app now and then, or unpause it from the Supabase dashboard.
