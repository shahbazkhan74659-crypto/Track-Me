import type { MetadataRoute } from "next";

// Personal, login-gated app with nothing worth indexing — keep it out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
