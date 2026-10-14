# Putting the site on GitHub Pages

The `github-repo` folder inside this project holds exactly the files the GitHub repository needs. GitHub builds the site from them and publishes it at:

```
https://<your-github-username>.github.io/<repository-name>/
```

You never upload a built site. You commit the files in `github-repo`, and GitHub builds and publishes it about two minutes later (the workflow is `github-repo/.github/workflows/deploy.yml`).

## One-time setup

### 1. Install GitHub Desktop

Download it from https://desktop.github.com and sign in with your GitHub account. It handles commits and uploads for you, including deletions, which the GitHub website's upload page can't do. The website's upload page is also limited to 100 files at a time, and this site has about 390.

### 2. Create the github-repo folder

In Terminal, go to this project folder (type `cd `, drag the `ras_ruchi` folder in, press Return), then run:

```bash
npm run github
```

It prints `github-repo ready: … files`. The folder now sits inside `ras_ruchi`.

### 3. Turn github-repo into your GitHub repository

**If you haven't created the repository on github.com yet (easiest):**

1. In GitHub Desktop: **File > Add Local Repository**, choose the `github-repo` folder.
2. It says the folder isn't a Git repository yet. Click **create a repository**.
3. In the form that opens, leave **Name** as `github-repo`: changing it here makes a new, empty folder instead of using this one. Leave **Initialize this repository with a README** unticked, **Git ignore** as *None* and **License** as *None*. Click **Create Repository**.
4. Click **Publish repository**. In this dialog, set **Name** to what you want in the web address, for example `ras_ruchi`. Untick **Keep this code private**: free GitHub accounts can only publish Pages from public repositories. Click **Publish repository**.

**If you already created the repository on github.com:** clone it into the `github-repo` spot, then fill it. This works whether or not GitHub added a README when it made the repository.

1. Move the `github-repo` folder to the Trash if it exists. A clone needs an empty spot, and step 4 recreates the folder.
2. In GitHub Desktop: **File > Clone Repository**, **GitHub.com** tab, select your repository.
3. In **Local path**, type the full path ending in `github-repo`, for example `/Users/neerajgadi/Documents/Python Files/Shruchi/ras_ruchi/github-repo`. Click **Clone**.
4. In Terminal, in the project folder, run `npm run github`. It ends with `Linked to git`.
5. In GitHub Desktop, write a summary such as "First version of the site", click **Commit to main**, then **Push origin**.

A private repository can only publish Pages on a paid GitHub plan. On a free account, make it public first: on github.com, **Settings > General**, at the bottom under **Danger Zone**, **Change visibility > Make public**. Even on a paid plan the published site itself is public.

### 4. Switch on GitHub Pages

On github.com, open the repository, then **Settings > Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### 5. Publish the first time

Open the repository's **Actions** tab. The first run, "Publish site to GitHub Pages", may have failed because Pages wasn't switched on yet. Open it and click **Re-run all jobs**. If no run is listed, choose the workflow on the left and click **Run workflow**.

When it shows a green tick (about two minutes), the site is live. The address is shown on the run's page and under **Settings > Pages**.

## Publishing a new version

1. Make your changes in this project (`ras_ruchi`), and check them locally with `npm run dev`.
2. Run `npm run github`. This empties `github-repo` and refills it with the current files, keeping its link to GitHub.
3. In GitHub Desktop, select the `github-repo` repository. It lists everything that changed, including files that were removed. Write a short summary (for example "New collection photos"), click **Commit to main**, then **Push origin**.
4. GitHub republishes the site in about two minutes. Progress shows in the **Actions** tab.

Because step 2 rebuilds the folder from scratch, a commit always matches the current site exactly: changed files are replaced and files that no longer exist are removed.

Don't edit files inside `github-repo` directly. The next `npm run github` replaces them.

## Good to know

- **Repository name = web address.** A repository named `ras_ruchi` publishes at `…github.io/ras_ruchi/`. If you rename it, the next publish adapts automatically.
- **Custom domain.** You can add one later under **Settings > Pages > Custom domain**. The build adapts to that too.
- **Running locally is unchanged.** `npm run build` and `npm start` still work as described in `instruction.txt`. The GitHub-only static mode switches on inside GitHub's build.
- **Photo permissions.** The product photographs belong to The Yellow Dwelling. Make sure they're happy for them to appear on a public site.
