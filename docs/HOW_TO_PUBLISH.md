# How to publish the site

The site is published by GitHub Pages, GitHub's free hosting. A workflow (an
automatic script GitHub runs for you, in `.github/workflows/deploy.yml`) builds the
site and publishes it every time something changes on the `main` branch.

## First time: turn on Pages

You only do this once.

1. Merge the work into `main`. If it's on another branch, open the repository on
   github.com, click **Pull requests**, open the pull request for the branch, and
   click **Merge pull request**. (If there's no pull request yet, GitHub shows a
   yellow "Compare & pull request" banner for recently pushed branches; click it,
   then **Create pull request**, then merge.)
2. Click **Settings** (top of the repository page), then **Pages** in the left menu.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Click the **Actions** tab. If the latest "Build and deploy" run on `main` failed
   because Pages wasn't on yet, open it and click **Re-run all jobs**.

When the run shows a green check, the site is live.

## Finding the live address

The address is:

**https://brubakerc.github.io/Claude-Website/**

It's also shown in **Settings → Pages**, and on each successful run in the Actions tab
(click the run, then the link under **deploy**).

## Publishing changes

Commit to `main`, on github.com or anywhere else. The site rebuilds in about two
minutes. Watch progress in the **Actions** tab:

- Yellow dot: building.
- Green check: published.
- Red X: the build stopped and the live site still shows the previous version.
  Click the run, then **build**, to read why. `HOW_TO_ADD_A_PROJECT.md` lists the
  common errors.

Pushes to other branches are built too, but not published. That's a free check
that a change works before you merge it.

## Optional: a custom domain

To use your own address (like `www.yourname.com`) instead of `github.io`:

1. Buy the domain from any registrar (Cloudflare, Namecheap, Porkbun, …).
2. In **Settings → Pages → Custom domain**, type the domain and click **Save**.
3. At your registrar, add the DNS records (the settings that point a domain at a
   server) that GitHub shows you. For `www.yourname.com` that's one `CNAME` record
   pointing `www` to `brubakerc.github.io`.
4. Wait for GitHub to show the domain as verified, then tick **Enforce HTTPS**.
5. Edit `astro.config.ts`: set `SITE` to `"https://www.yourname.com"` and `BASE` to
   `"/"`. Commit. (The comments in that file show this too.)

GitHub's own guide: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## If you rename the repository

The address includes the repository name. After renaming, edit `astro.config.ts` and
set `BASE` to `"/new-name"`, or every link on the site will break. If you rename it
to `brubakerc.github.io`, the site moves to the root address: set `BASE` to `"/"`.
