# ras.ruchi

The textile work of Shruchi Jaiswal: her collections for The Yellow Dwelling shown as a shade card, and her craft studies in her own words.

This repository holds the website's source. Every push to `main` builds it and publishes it to GitHub Pages automatically (see `.github/workflows/deploy.yml`); the address appears under **Settings > Pages**.

## Updating the site

Don't edit files here by hand. The files in this repository are generated from the main project folder (`ras_ruchi`):

1. Make the change in the main project.
2. In the main project folder, run `npm run github`. This rebuilds the `github-repo` folder with the current files.
3. Commit everything in `github-repo` and push. Files that no longer exist are removed in the same commit, and GitHub republishes the site in about two minutes.

Product photographs belong to The Yellow Dwelling; study images and text are from Shruchi's Behance.
