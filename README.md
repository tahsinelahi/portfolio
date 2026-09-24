# Tahsin Farjana Elahi — Portfolio Website (2026)

This folder is your complete portfolio website. It works anywhere — no special
software needed. Put it on the internet in three steps.

---

## Step 1 — Put the site online (free)

**Option A: Netlify Drop (easiest, no account needed to start)**
1. Go to **app.netlify.com/drop**
2. Drag the **`portfolio-site.zip`** file from this folder onto the page
   (or unzip it first and drag the unzipped folder — either works)
3. Netlify gives you a live link like `https://tahsin-portfolio.netlify.app`
4. Done — your site is live. (Making a free Netlify account lets you edit the
   site name and keep control of it — recommended.)

**Option B: Vercel**
1. Go to **vercel.com** and sign up (free)
2. Click **Add New → Project → Upload** and upload **`portfolio-site.zip`**
3. Vercel gives you a live link like `https://tahsin-portfolio.vercel.app`

## Step 2 — Buy your domain name

Buy the name you want from any registrar (about $10–15/year):
- **Cloudflare Registrar** (cloudflare.com — cheapest, no markup), or
- **Namecheap** (namecheap.com), or **Porkbun** (porkbun.com)

Good options: `tahsinelahi.com`, `tahsinelahi.design`, `tahsinelahi.archi`
(Note: endings like `.elahi` don't exist, so pick one of the real ones above.)

## Step 3 — Connect your domain to the site

**On Netlify:**
1. Open your site → **Domain settings → Add custom domain** → type your domain
2. Netlify will show you a DNS value. Go to your registrar's DNS page and:
   - For the root domain (`tahsinelahi.com`): add the **A record** Netlify shows
     (usually `75.2.60.5`), or
   - For `www`: add the **CNAME record** pointing to your Netlify address
     (e.g. `tahsin-portfolio.netlify.app`)
3. Wait a few minutes to a few hours — your portfolio is now at your own
   address, with free HTTPS automatically.

**On Vercel:**
1. Open your project → **Settings → Domains** → type your domain
2. Vercel shows you the exact DNS records to add — copy them into your
   registrar's DNS page (an **A record** for the root domain, a **CNAME**
   for `www`)
3. Wait for DNS to update — done, with free HTTPS automatically.

---

## What's in this folder

- `index.html` — the whole site (one page)
- `assets/css/style.css` — all styling
- `assets/js/main.js` — animations (preloader, reveals, cursor, magnetic buttons)
- `assets/img/` — 28 high-resolution images of your portfolio sheets, shown full
  and never cropped
- `portfolio-site.zip` — everything above in one file, ready to upload

## Making changes later

- **Swap an image:** replace the file in `assets/img/` with a new one using the
  exact same file name, then re-upload.
- **Change text:** open `index.html` in any text editor, edit the words, save,
  re-upload.
- **Fonts** load from Google Fonts (the only internet dependency — everything
  else works offline).

## Notes

- All project titles, captions, and credits are taken from your approved
  portfolio PDF — nothing invented.
- Contact: tfe3974@mavs.uta.edu · +1 515-451-8963 · Arlington, Texas
