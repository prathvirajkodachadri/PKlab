import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  pageType?: "website" | "article" | "calculator";
  schemaData?: object;
}

export default function SEO({
  title,
  description,
  canonical,
  pageType = "website",
  schemaData
}: SEOProps) {
  useEffect(() => {
    // Update simple meta tags
    document.title = `${title} | PKlab`;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonical);

    // Open Graph / Twitter Meta Tags
    const ogTags = [
      { property: "og:title", content: `${title} | PKlab` },
      { property: "og:description", content: description },
      { property: "og:type", content: pageType },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: "PKlab Engineering Calculators" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=630&q=80" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${title} | PKlab` },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=630&q=80" }
    ];

    ogTags.forEach(tag => {
      const keyAttr = tag.property ? "property" : "name";
      const keyVal = tag.property || tag.name || "";
      let el = document.querySelector(`meta[${keyAttr}="${keyVal}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(keyAttr, keyVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", tag.content);
    });

    // Inject JSON-LD Schema
    const schemaId = "pklab-jsonld-schema";
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (scriptEl) {
      scriptEl.remove();
    }

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "PKlab",
      "url": "https://pklab.engineering",
      "description": "Professional engineering calculators for CNC machine design."
    };

    // `@graph` schemas (e.g. SoftwareApplication + BreadcrumbList) replace the
    // base WebSite node entirely to keep the JSON-LD tree valid.
    const combinedSchema = schemaData
      ? "@graph" in (schemaData as object)
        ? { "@context": "https://schema.org", ...(schemaData as object) }
        : { ...baseSchema, ...(schemaData as object) }
      : baseSchema;

    scriptEl = document.createElement("script");
    scriptEl.id = schemaId;
    scriptEl.type = "application/ld+json";
    scriptEl.text = JSON.stringify(combinedSchema, null, 2);
    document.head.appendChild(scriptEl);

    return () => {
      // Cleanup custom schemas
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [title, description, canonical, pageType, schemaData]);

  return null; // Side-effect only component
}
