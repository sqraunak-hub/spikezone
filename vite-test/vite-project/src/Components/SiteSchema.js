import { useEffect } from "react";
import { SITE_URL } from "../Utils/appConstant";

/**
 * Site-wide JSON-LD. The site had none at all, so Google had nothing
 * structured to work with — no knowledge-panel data, no sitelinks search box,
 * no breadcrumb trail in the result.
 *
 * Everything below is real, taken from the contact page and the footer:
 * the Najafgarh address, the published phone and support address, and the
 * social profiles. Nothing here is invented — a Product or Review block with
 * made-up numbers would be a policy violation, not an optimisation.
 */
const ORG_ID = `${SITE_URL}/#organization`;

const schema = () => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "SpikeZone",
    alternateName: "SpikeZone Bird Spikes",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/og-cover.jpg`,
    image: `${SITE_URL}/og-cover.jpg`,
    description:
      "Indian manufacturer of humane bird control products since 2015 — bird spikes, pigeon spikes, monkey spikes and anti bird netting.",
    foundingDate: "2015",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot No. 3, Main Kair Road, Mitraon, Najafgarh",
      addressLocality: "South West Delhi",
      addressRegion: "Delhi",
      postalCode: "110043",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-99909-55869",
        email: "support@spikezone.in",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    ],
    sameAs: [
      "https://www.facebook.com/spikezoneltd/",
      "https://twitter.com/spikezoneltd",
      "https://www.instagram.com/spikezone_birdspikes/",
      "https://in.linkedin.com/company/spikezone-bird-spikes",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: "SpikeZone",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products/search?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

const ID = "sz-site-schema";

export default function SiteSchema() {
  useEffect(() => {
    let el = document.getElementById(ID);
    if (!el) {
      el = document.createElement("script");
      el.id = ID;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema());
  }, []);

  return null;
}
