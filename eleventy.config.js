import eleventySass from "eleventy-sass";
import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function(eleventyConfig) {
  // Add Sass plugin
  eleventyConfig.addPlugin(eleventySass, {
    sass: {
      loadPaths: ["_sass"]
    }
  });

  // Add RSS plugin
  eleventyConfig.addPlugin(rssPlugin);

  // Watch Sass directory for changes
  eleventyConfig.addWatchTarget("_sass/");

  return {
    dir: {
      input: ".",
      output: "_site"
    },
    templateFormats: ["liquid", "md", "html"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid"
  };
}
