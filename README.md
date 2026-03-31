# Keppner Family Recipes

A digital collection of family recipes, migrated from Jekyll to Eleventy.

## Prerequisites

*   [Node.js](https://nodejs.org/) 20 or newer (required for Eleventy v3)
*   npm (comes with Node.js)

## Local Development

Install dependencies and start the development server with live reload.

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:8080`.

## Build

Generate the static site in the `_site` directory.

```bash
npm run build
```

## Verify

Run the verification script to check for common build issues.

```bash
npm run verify
```

## Project Structure

*   `_posts/`: Recipe markdown files
*   `_layouts/`: Page templates (Liquid)
*   `_includes/`: Reusable components and partials
*   `_sass/`: Stylesheets
*   `_data/`: Global data files

## Adding a Recipe

Create a new file in `_posts/` with the naming convention `YYYY-MM-DD-slug.md`. Use the following front matter template:

```markdown
---
layout: post
title: "Recipe Name"
date: YYYY-MM-DD HH:MM:SS -0700
categories: [category1, category2]
permalink: /recipes/recipe-slug.html
image: /images/recipe-image.jpg
---

Recipe content goes here.
```

## Cross-referencing Recipes

To link to another recipe, use the `post_url` shortcode with the filename slug (excluding the date prefix and extension).

```njk
{% post_url "YYYY-MM-DD-slug" %}
```

## Cloudflare Pages Setup

The site is configured for deployment on Cloudflare Pages.

### Initial Setup

1.  Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2.  Click **Create application** → **Pages** → **Connect to Git**.
3.  Select the `keppner-recipes-js` repository.
4.  Configure the **Build settings**:
    *   **Framework preset**: None
    *   **Build command**: `npm run build`
    *   **Output directory**: `_site`
5.  Add an **Environment variable**:
    *   **Variable name**: `NODE_VERSION`
    *   **Value**: `20`
6.  Click **Save and Deploy**.

### Custom Domain

1.  Go to the **Custom domains** tab of your project.
2.  Click **Set up a custom domain**.
3.  Enter `recipes.keppner.net` and follow the instructions to update your DNS records.

### Automatic Deployments

Every push to the `main` branch will automatically trigger a new build and deployment.
