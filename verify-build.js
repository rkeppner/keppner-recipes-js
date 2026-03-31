import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SITE = '_site';
const EXPECTED_RECIPE_COUNT = 137;
const EXPECTED_PAGINATION_PAGES = 7;
const CATEGORIES = [
  'appetizer', 'asian', 'barbecue', 'bread', 'breakfast', 'british',
  'cajun', 'carnival', 'dessert', 'diet', 'drink', 'indian', 'irish',
  'italian', 'korean', 'mediterranean', 'mexican', 'pasta', 'pizza',
  'sandwich', 'sides', 'soup'
];

let passed = 0;
let failed = 0;

function check(label, result, detail = '') {
  if (result) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

// ── 1. Recipe count ──────────────────────────────────────────────────────────
console.log('\n[1] Recipe count');
const recipesDir = join(SITE, 'recipes');
let recipeFiles = [];
if (existsSync(recipesDir)) {
  recipeFiles = readdirSync(recipesDir).filter(f => f.endsWith('.html'));
}
check(
  `Exactly ${EXPECTED_RECIPE_COUNT} recipe HTML files`,
  recipeFiles.length === EXPECTED_RECIPE_COUNT,
  `found ${recipeFiles.length}`
);

// ── 2. Category pages ────────────────────────────────────────────────────────
console.log('\n[2] Category pages');
for (const cat of CATEGORIES) {
  const catIndex = join(SITE, 'categories', cat, 'index.html');
  check(`categories/${cat}/index.html exists`, existsSync(catIndex));
}

// ── 3. Pagination pages ──────────────────────────────────────────────────────
console.log('\n[3] Pagination pages');
check('_site/index.html exists', existsSync(join(SITE, 'index.html')));
for (let page = 2; page <= EXPECTED_PAGINATION_PAGES; page++) {
  const paginationPath = join(SITE, 'recipes', String(page), 'index.html');
  check(`recipes/${page}/index.html exists`, existsSync(paginationPath));
}

// ── 4. Static pages ──────────────────────────────────────────────────────────
console.log('\n[4] Static pages');
check('_site/about.html exists', existsSync(join(SITE, 'about.html')));
check('_site/archives/index.html exists', existsSync(join(SITE, 'archives', 'index.html')));
check('_site/404.html exists', existsSync(join(SITE, '404.html')));

// ── 5. Feed ──────────────────────────────────────────────────────────────────
console.log('\n[5] Feed');
const feedPath = join(SITE, 'feed.xml');
const feedExists = existsSync(feedPath);
check('_site/feed.xml exists', feedExists);
if (feedExists) {
  const feedSize = statSync(feedPath).size;
  check(`feed.xml is non-empty (>100 bytes, got ${feedSize})`, feedSize > 100);
}

// ── 6. Sitemap ───────────────────────────────────────────────────────────────
console.log('\n[6] Sitemap');
const sitemapPath = join(SITE, 'sitemap.xml');
const sitemapExists = existsSync(sitemapPath);
check('_site/sitemap.xml exists', sitemapExists);
if (sitemapExists) {
  const sitemapSize = statSync(sitemapPath).size;
  check(`sitemap.xml is non-empty (got ${sitemapSize} bytes)`, sitemapSize > 0);
}

// ── 7. CSS ───────────────────────────────────────────────────────────────────
console.log('\n[7] CSS');
const cssPath = join(SITE, 'assets', 'main.css');
const cssExists = existsSync(cssPath);
check('_site/assets/main.css exists', cssExists);
if (cssExists) {
  const cssSize = statSync(cssPath).size;
  check(`main.css is non-empty (>100 bytes, got ${cssSize})`, cssSize > 100);
}

// ── 8. No unprocessed post_url tags ─────────────────────────────────────────
console.log('\n[8] No unprocessed post_url tags in recipe body content');
let postUrlMatches = 0;
const postUrlRecipes = [];
for (const file of recipeFiles) {
  const filePath = join(recipesDir, file);
  const content = readFileSync(filePath, 'utf8');
  // Strip meta tags, then look for {% post_url ... %} literal tag syntax
  // (not the word "post_url" in meta description values from excerpt text)
  const withoutMeta = content.replace(/<meta[^>]*>/gi, '');
  if (withoutMeta.includes('{%') && withoutMeta.includes('post_url')) {
    postUrlMatches++;
    postUrlRecipes.push(file);
  }
}
check(
  `0 unprocessed post_url tags in body content (found ${postUrlMatches})`,
  postUrlMatches === 0,
  postUrlMatches > 0 ? `files: ${postUrlRecipes.slice(0, 5).join(', ')}` : ''
);

// ── 9. Cross-reference link targets ─────────────────────────────────────────
console.log('\n[9] Cross-reference link targets');
let brokenLinks = 0;
const brokenLinkDetails = [];
const hrefPattern = /href="\/recipes\/([^"#?]+)"/g;
for (const file of recipeFiles) {
  const filePath = join(recipesDir, file);
  const content = readFileSync(filePath, 'utf8');
  let match;
  while ((match = hrefPattern.exec(content)) !== null) {
    const slug = match[1];
    // slug may be 'some-recipe.html' or 'some-recipe/' or '2/index.html' etc.
    // We only care about direct recipe slugs (no subdirectory pagination links)
    if (slug.includes('/')) continue; // skip pagination links like "2/index.html"
    const targetSlug = slug.endsWith('.html') ? slug : `${slug}.html`;
    const targetPath = join(recipesDir, targetSlug);
    if (!existsSync(targetPath)) {
      brokenLinks++;
      if (brokenLinkDetails.length < 5) {
        brokenLinkDetails.push(`${file} → /recipes/${slug}`);
      }
    }
  }
}
check(
  `0 broken cross-reference links (found ${brokenLinks})`,
  brokenLinks === 0,
  brokenLinks > 0 ? `examples: ${brokenLinkDetails.join(', ')}` : ''
);

// ── Summary ──────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${'─'.repeat(50)}`);
console.log(`${passed}/${total} checks passed`);
if (failed > 0) {
  console.log(`${failed} check(s) FAILED`);
  process.exit(1);
} else {
  console.log('All checks passed!');
  process.exit(0);
}
