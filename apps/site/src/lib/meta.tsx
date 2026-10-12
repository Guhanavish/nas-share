import { useEffect } from "react";
import { GITHUB_REPO } from "../lib/site";

const SITE_URL = "https://nas-share-c941u6fq5-gt4.vercel.app";

/** Per-page title, description and canonical. Call at the top of each page. */
export function useMeta(opts: { title: string; description: string; path: string }) {
  useEffect(() => {
    document.title = opts.title;
    const url = `${SITE_URL}${opts.path}`;

    const set = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };

    const desc = set('meta[name="description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    }) as HTMLMetaElement;
    desc.content = opts.description;

    const canon = set('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }) as HTMLLinkElement;
    canon.href = url;

    const ogTitle = set('meta[property="og:title"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:title");
      return m;
    }) as HTMLMetaElement;
    ogTitle.content = opts.title;

    const ogDesc = set('meta[property="og:description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:description");
      return m;
    }) as HTMLMetaElement;
    ogDesc.content = opts.description;

    const ogUrl = set('meta[property="og:url"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:url");
      return m;
    }) as HTMLMetaElement;
    ogUrl.content = url;
  }, [opts.title, opts.description, opts.path]);
}

const SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nasend",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: ["Android", "Windows", "Android TV"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://opensource.org/licenses/MIT",
  downloadUrl: `https://github.com/${GITHUB_REPO}/releases/latest`,
  description:
    "Turn phones, TVs and PCs into one private device cloud. Pool every device into a single section, pair with an 8-character code, pull files over LAN or relay.",
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do my files go through your servers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. On WiFi devices talk directly. Anywhere else, the Cloudflare Worker only introduces the two devices or forwards encrypted chunks as a last resort. Files are never stored.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Never. Pairing uses a single-use 8-character code. Identities pin on first trust and reconnect automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Will it work on my TV?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The same APK installs on phones, tablets and Google TV with a fully remote-driven interface.",
      },
    },
  ],
};

/** Inject JSON-LD schema once per mount. */
export function useSchema(id: string, schema: unknown) {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
  }, [id, schema]);
}

export { SOFTWARE_SCHEMA, FAQ_SCHEMA };
