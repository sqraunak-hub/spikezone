/**
 * The three product families and the links that belong to each.
 *
 * One list, two consumers: the top-menu dropdowns (NavMegaMenu) and the home
 * page panels (HomeCategories). Keeping it here is the point — the menu and
 * the home page drifted apart when each had its own copy.
 *
 * The first four groups are the sections the site is organised around, in the
 * order they appear in the menu:
 *
 *   Bird Control | Solution | Application | Location
 *
 * "Types" and "FAQs" follow on the home page only. They link into the guides
 * themselves; build.py puts an id on every h2/h3, so those anchors land on the
 * real section rather than a URL invented to fill a column.
 *
 * Every href below points at a page that exists — see the link check in
 * scripts, which resolves each one against public/content/index.json.
 */

/* The product guides. The same list appears in all three menus so a visitor
   who opened the wrong one can cross over without going back. */
const GUIDES = [
  { label: "Bird Spikes", to: "/bird-control/bird-spikes/" },
  { label: "Pigeon Spikes", to: "/bird-control/pigeon-spikes/" },
  { label: "Monkey Spikes", to: "/bird-control/monkey-spikes/" },
  { label: "Anti Bird Net", to: "/bird-control/anti-bird-net/" },
  { label: "Bird Feeders", to: "/bird-care/bird-feeders/" },
];

const BIRD_CONTROL = {
  id: "bird-control",
  heading: "Bird Control",
  sub: "Our Products",
  links: GUIDES,
  all: { label: "All products", to: "/bird-control/" },
};

const PROPERTY_TYPES = [
  { label: "Residential", to: "/solutions/residential/" },
  { label: "Commercial", to: "/solutions/commercial/" },
  { label: "Industrial", to: "/solutions/industrial/" },
];

export const FAMILIES = [
  {
    id: "bird-spikes",
    hue: 1,
    title: "Bird & Pigeon Spikes",
    shortTitle: "Bird Spikes",
    blurb:
      "Humane and effective solutions to keep birds away from your property.",
    to: "/bird-control/bird-spikes/",
    tagline: ["A Smarter Way to", "Keep Birds Away"],
    trust: ["Safe", "Humane", "Long-Lasting"],
    groups: [
      BIRD_CONTROL,
      {
        id: "solution",
        heading: "Solution",
        sub: "Where Birds Land",
        links: [
          { label: "Balcony", to: "/solutions/balcony-bird-problems/" },
          { label: "Window sill", to: "/solutions/window-sill-bird-problems/" },
          { label: "Ledge", to: "/solutions/ledge-bird-problems/" },
          { label: "Parapet wall", to: "/solutions/parapet-bird-problems/" },
          { label: "Railing", to: "/solutions/railing-bird-problems/" },
          { label: "Rooftop", to: "/solutions/rooftop-bird-problems/" },
          ...PROPERTY_TYPES,
        ],
        all: { label: "All solutions", to: "/solutions/" },
      },
      {
        id: "application",
        heading: "Application",
        sub: "Where You Need It",
        links: [
          { label: "Balcony", to: "/applications/balcony/" },
          { label: "Window ledge", to: "/applications/window/" },
          { label: "Rooftop", to: "/applications/rooftop/" },
          { label: "Solar panels", to: "/applications/solar-panels/" },
          { label: "AC outdoor unit", to: "/applications/ac-outdoor-unit/" },
          { label: "Cable trays", to: "/applications/cable-tray/" },
        ],
        all: { label: "All applications", to: "/applications/" },
      },
      {
        id: "location",
        heading: "Location",
        sub: "Where We Supply",
        links: [
          { label: "Delhi", to: "/locations/delhi/bird-spikes/" },
          { label: "Mumbai", to: "/locations/mumbai/bird-spikes/" },
          { label: "Bangalore", to: "/locations/bangalore/bird-spikes/" },
          { label: "Gurgaon", to: "/locations/gurgaon/bird-spikes/" },
          { label: "Noida", to: "/locations/noida/bird-spikes/" },
          { label: "Pune", to: "/locations/pune/bird-spikes/" },
        ],
        all: { label: "All 15 cities", to: "/locations/" },
      },
      {
        id: "types",
        heading: "Types",
        sub: "Choose the Right Spike",
        links: [
          {
            label: "Stainless steel spikes",
            to: "/bird-control/bird-spikes/#stainless-steel-bird-spikes",
          },
          {
            label: "Polycarbonate spikes",
            to: "/bird-control/bird-spikes/#polycarbonate-bird-spikes",
          },
          {
            label: "Single-row spikes",
            to: "/bird-control/bird-spikes/#single-row-bird-spikes",
          },
          {
            label: "Double & multi-row",
            to: "/bird-control/bird-spikes/#double-row-and-multi-row-bird-spikes",
          },
        ],
        all: { label: "Shop bird spikes", to: "/products/bird-spikes" },
      },
      {
        id: "faqs",
        heading: "FAQs",
        sub: "Get All Your Answers",
        links: [
          {
            label: "Bird spike FAQs",
            to: "/bird-control/bird-spikes/#frequently-asked-questions",
          },
          {
            label: "Installation",
            to: "/bird-control/bird-spikes/#bird-spike-installation",
          },
          {
            label: "Spikes vs other methods",
            to: "/bird-control/bird-spikes/#bird-spikes-vs-other-bird-control-methods",
          },
          {
            label: "Pigeon spike FAQs",
            to: "/bird-control/pigeon-spikes/#frequently-asked-questions",
          },
        ],
        all: { label: "Ask our team", to: "/contact" },
      },
    ],
  },

  {
    id: "monkey-spikes",
    hue: 3,
    title: "Monkey Spikes",
    shortTitle: "Monkey Spikes",
    blurb:
      "Strong and durable spikes designed to deter monkeys and prevent damage.",
    to: "/bird-control/monkey-spikes/",
    tagline: ["Close the Route,", "Not Just One Wall"],
    trust: ["Humane", "Non-Electric", "Heavy-Duty"],
    groups: [
      BIRD_CONTROL,
      {
        id: "solution",
        heading: "Solution",
        sub: "Where Monkeys Climb",
        links: [
          { label: "Parapet wall", to: "/solutions/parapet-bird-problems/" },
          { label: "Rooftop", to: "/solutions/rooftop-bird-problems/" },
          { label: "Ledge", to: "/solutions/ledge-bird-problems/" },
          { label: "Pillar", to: "/solutions/pillar-bird-problems/" },
          { label: "Railing", to: "/solutions/railing-bird-problems/" },
          { label: "Wall edge", to: "/solutions/edge-bird-problems/" },
          ...PROPERTY_TYPES,
        ],
        all: { label: "All solutions", to: "/solutions/" },
      },
      {
        id: "application",
        heading: "Application",
        sub: "Where You Need It",
        links: [
          { label: "Rooftop & terrace", to: "/applications/rooftop/" },
          { label: "Warehouse", to: "/applications/warehouse/" },
          { label: "Factory", to: "/applications/factory/" },
          { label: "Balcony", to: "/applications/balcony/" },
          { label: "Window ledge", to: "/applications/window/" },
        ],
        all: { label: "All applications", to: "/applications/" },
      },
      {
        id: "location",
        heading: "Location",
        sub: "Where We Supply",
        links: [
          { label: "Delhi", to: "/locations/delhi/monkey-spikes/" },
          { label: "Mumbai", to: "/locations/mumbai/monkey-spikes/" },
          { label: "Jaipur", to: "/locations/jaipur/monkey-spikes/" },
          { label: "Gurgaon", to: "/locations/gurgaon/monkey-spikes/" },
          { label: "Noida", to: "/locations/noida/monkey-spikes/" },
          { label: "Lucknow", to: "/locations/lucknow/monkey-spikes/" },
        ],
        all: { label: "All 15 cities", to: "/locations/" },
      },
      {
        id: "types",
        heading: "Types",
        sub: "Built for the Actual Load",
        links: [
          {
            label: "Heavy-gauge pins",
            to: "/bird-control/monkey-spikes/#heavy-gauge-pins",
          },
          {
            label: "Rigid fixed base",
            to: "/bird-control/monkey-spikes/#rigid-strongly-fixed-base",
          },
          {
            label: "Corrosion protected",
            to: "/bird-control/monkey-spikes/#corrosion-protected",
          },
          {
            label: "Non-electric",
            to: "/bird-control/monkey-spikes/#non-electric",
          },
        ],
        all: {
          label: "All features",
          to: "/bird-control/monkey-spikes/#key-features",
        },
      },
      {
        id: "faqs",
        heading: "FAQs",
        sub: "Get All Your Answers",
        links: [
          {
            label: "Monkey spike FAQs",
            to: "/bird-control/monkey-spikes/#frequently-asked-questions",
          },
          {
            label: "Planning an install",
            to: "/bird-control/monkey-spikes/#planning-a-monkey-spike-installation",
          },
          {
            label: "vs other deterrents",
            to: "/bird-control/monkey-spikes/#monkey-spikes-vs-other-monkey-deterrents",
          },
          {
            label: "Is it humane?",
            to: "/bird-control/monkey-spikes/#are-monkey-spikes-harmful-to-monkeys",
          },
        ],
        all: { label: "Ask our team", to: "/contact" },
      },
    ],
  },

  {
    id: "anti-bird-net",
    hue: 2,
    title: "Anti Bird Net",
    shortTitle: "Anti Bird Net",
    blurb:
      "High quality nets for complete bird proofing and long term protection.",
    to: "/bird-control/anti-bird-net/",
    tagline: ["A Smarter Way to", "Keep Birds Away"],
    trust: ["Safe", "Humane", "Long-Lasting"],
    groups: [
      BIRD_CONTROL,
      {
        id: "solution",
        heading: "Solution",
        sub: "Openings We Close",
        links: [
          { label: "Balcony", to: "/solutions/balcony-bird-problems/" },
          { label: "Warehouse", to: "/solutions/warehouse-bird-problems/" },
          { label: "Roof truss", to: "/solutions/truss-bird-problems/" },
          { label: "Building facade", to: "/solutions/facade-bird-problems/" },
          { label: "Dome", to: "/solutions/dome-bird-problems/" },
          { label: "Girder", to: "/solutions/girder-bird-problems/" },
          ...PROPERTY_TYPES,
        ],
        all: { label: "All solutions", to: "/solutions/" },
      },
      {
        id: "application",
        heading: "Application",
        sub: "Where You Need It",
        links: [
          { label: "Balcony", to: "/applications/balcony/" },
          { label: "Warehouse", to: "/applications/warehouse/" },
          { label: "Factory", to: "/applications/factory/" },
          { label: "Rooftop", to: "/applications/rooftop/" },
          { label: "Window", to: "/applications/window/" },
        ],
        all: { label: "All applications", to: "/applications/" },
      },
      {
        id: "location",
        heading: "Location",
        sub: "Where We Provide Protection",
        links: [
          { label: "Delhi", to: "/locations/delhi/anti-bird-net/" },
          { label: "Mumbai", to: "/locations/mumbai/anti-bird-net/" },
          { label: "Bangalore", to: "/locations/bangalore/anti-bird-net/" },
          { label: "Hyderabad", to: "/locations/hyderabad/anti-bird-net/" },
          { label: "Chennai", to: "/locations/chennai/anti-bird-net/" },
          { label: "Pune", to: "/locations/pune/anti-bird-net/" },
        ],
        all: { label: "All 15 cities", to: "/locations/" },
      },
      {
        id: "types",
        heading: "Types",
        sub: "Choose the Right Net",
        links: [
          {
            label: "Choosing a net",
            to: "/bird-control/anti-bird-net/#choosing-the-right-net",
          },
          { label: "Mesh size", to: "/bird-control/anti-bird-net/#mesh-size" },
          {
            label: "Fixing method",
            to: "/bird-control/anti-bird-net/#fixing-method",
          },
          {
            label: "Tension & access",
            to: "/bird-control/anti-bird-net/#tension-and-access",
          },
        ],
        all: {
          label: "How it is installed",
          to: "/bird-control/anti-bird-net/#how-netting-is-installed",
        },
      },
      {
        id: "faqs",
        heading: "FAQs",
        sub: "Get All Your Answers",
        links: [
          {
            label: "Bird net FAQs",
            to: "/bird-control/anti-bird-net/#frequently-asked-questions",
          },
          {
            label: "What mesh do I need?",
            to: "/bird-control/anti-bird-net/#what-mesh-size-do-i-need",
          },
          {
            label: "Net vs spikes",
            to: "/bird-control/anti-bird-net/#anti-bird-net-vs-bird-spikes",
          },
          {
            label: "Society permission",
            to: "/bird-control/anti-bird-net/#do-i-need-society-permission",
          },
        ],
        all: { label: "Ask our team", to: "/contact" },
      },
    ],
  },
];

/* The menu and the home panel now show the same six groups, in this order. */
export const NAV_GROUP_IDS = [
  "bird-control",
  "solution",
  "application",
  "location",
  "types",
  "faqs",
];

export const navGroups = (family) =>
  NAV_GROUP_IDS.map((id) => family.groups.find((g) => g.id === id)).filter(
    Boolean
  );

export const familyById = (id) => FAMILIES.find((f) => f.id === id);
