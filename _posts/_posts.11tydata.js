export default {
  layout: "post",
  eleventyComputed: {
    categories: (data) => {
      if (!data.categories) return [];
      if (Array.isArray(data.categories)) return data.categories;
      return String(data.categories).trim().split(/\s+/).filter(Boolean);
    },
    excerpt: (data) => {
      const content = data.page?.rawInput || "";
      const fmEnd = content.indexOf("---", 3);
      const body = fmEnd !== -1 ? content.slice(fmEnd + 3).trim() : content;
      const firstPara = body.split(/\n\n/)[0] || "";
      return firstPara.trim();
    }
  }
};
