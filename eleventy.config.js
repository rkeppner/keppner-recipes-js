import eleventySass from "eleventy-sass";
import rssPlugin from "@11ty/eleventy-plugin-rss";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDataPath = path.join(configDirectory, "_data", "site.json");

let siteUrl = "";
try {
  const siteData = JSON.parse(readFileSync(siteDataPath, "utf8"));
  siteUrl = siteData?.url || "";
} catch {
  siteUrl = "";
}

export default function(eleventyConfig) {
  // Add Sass plugin
  eleventyConfig.addPlugin(eleventySass, {
    sass: {
      loadPaths: ["_sass"],
      style: "expanded"
    }
  });

  // Add RSS plugin
  eleventyConfig.addPlugin(rssPlugin);

  eleventyConfig.addFilter("relative_url", (url) => {
    return url;
  });

  eleventyConfig.addFilter("absolute_url", (url) => {
    return `${siteUrl || ""}${url || ""}`;
  });

  eleventyConfig.addFilter("date_to_xmlschema", (date) => {
    return new Date(date).toISOString();
  });

  eleventyConfig.addFilter("smartify", (str) => {
    const input = String(str || "");
    return input
      .replace(/"([^"]*)"/g, "\u201c$1\u201d")
      .replace(/'([^']*)'/g, "\u2018$1\u2019");
  });

  eleventyConfig.addFilter("xml_escape", (str) => {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  });

  eleventyConfig.addFilter("normalize_whitespace", (str) => {
    return String(str || "").replace(/\s+/g, " ").trim();
  });

  eleventyConfig.addShortcode("post_url", function(slug) {
    const requestedSlug = String(slug || "").trim();
    const collections = this?.ctx?.environments?.collections || this?.collections || {};
    const postEntries = Array.isArray(collections.posts)
      ? collections.posts
      : Array.isArray(collections.all)
        ? collections.all.filter((entry) => entry?.inputPath?.includes("/_posts/"))
        : [];

    const matchedPost = postEntries.find((entry) => {
      const inputPath = entry?.inputPath;
      if (!inputPath) {
        return false;
      }
      return path.parse(inputPath).name === requestedSlug;
    });

    if (!matchedPost?.url) {
      return `#post-not-found-${requestedSlug}`;
    }

    return matchedPost.url;
  });

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Watch Sass directory for changes
  eleventyConfig.addWatchTarget("_sass/");

  // Passthrough copy robots.txt
  eleventyConfig.addPassthroughCopy("robots.txt");

  return {
    dir: {
      input: ".",
      output: "_site",
      layouts: "_layouts",
      includes: "_includes"
    },
    templateFormats: ["liquid", "md", "html"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid"
  };
}
