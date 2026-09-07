"""Per-city facts used to generate the city-specific half of each
/locations/<city>/<product>/ page.

These pages exist 75 times (15 cities x 5 products). Repeating the same product
explanation on all of them would be near-duplicate content, so the generated
sections deliberately carry only what actually differs by city: the air the
product has to survive, the building stock we supply into, and the areas served.

Every field below is city-specific prose, not a shared template, so two cities
sharing a climate profile still read differently.
"""

# profile -> the material conclusion it drives
PROFILES = {
    "coastal": {
        "material": "SS-304 stainless steel",
        "avoid": "galvanised and mild steel",
        "reason": "salt-laden air corrodes ordinary steel fast, and rust streaks on a "
        "painted facade do not wash off",
    },
    "humid": {
        "material": "SS-304 stainless steel",
        "avoid": "untreated mild steel",
        "reason": "sustained humidity keeps surfaces damp for months at a time, which "
        "is when cheaper steel starts to bloom",
    },
    "dusty": {
        "material": "SS-304 stainless steel, or polycarbonate where looks matter",
        "avoid": "adhesive-only fixing on unwashed surfaces",
        "reason": "dust films stop silicone bonding properly, and the summer-to-winter "
        "swing works at any fixing that was not pressed down well",
    },
    "dry-hot": {
        "material": "SS-304 stainless steel; UV-treated polycarbonate on visible elevations",
        "avoid": "untreated plastics",
        "reason": "months of hard direct sun make cheap plastic brittle long before the "
        "steel is anywhere near failing",
    },
    "moderate": {
        "material": "SS-304 stainless steel for exposed runs, polycarbonate elsewhere",
        "avoid": "nothing in particular",
        "reason": "the climate is kind to fixings, so the specification is driven by "
        "appearance and surface width rather than corrosion",
    },
}

CITIES = {
    "delhi": {
        "name": "Delhi",
        "profile": "dusty",
        "ncr": True,
        "climate_note": "Delhi puts a fixing through about as wide a range as anywhere "
        "in India: 45°C-plus in May, single figures in January, and a dust load that "
        "coats every ledge between them. The dust is the practical problem, because "
        "silicone will not bond through it.",
        "bird_note": "Pigeon densities in the older colonies are among the highest we "
        "supply into, so partial coverage fails faster here than almost anywhere else.",
        "buildings": [
            ("DDA flats and older colonies", "Deep chajjas over every window and long "
             "shared balconies. The chajja is usually the real perch and the balcony "
             "railing just catches what falls."),
            ("Independent houses in the colonies", "Parapet runs, mumty edges and water "
             "tank platforms on the terrace, plus a boundary wall."),
            ("Newer apartment towers", "Continuous elevation-length ledges and rows of "
             "AC outdoor units on brackets, usually treated a whole face at a time."),
        ],
        "areas": ["Najafgarh", "Dwarka", "Janakpuri", "Rohini", "Pitampura", "Saket",
                  "Vasant Kunj", "Lajpat Nagar", "Mayur Vihar", "Karol Bagh"],
    },
    "noida": {
        "name": "Noida",
        "profile": "dusty",
        "ncr": True,
        "climate_note": "Same NCR extremes as Delhi, with more construction dust in the "
        "newer sectors. On a half-built stretch, expect to wash a ledge twice before "
        "adhesive will take.",
        "bird_note": "Occupied towers next to under-construction ones get the worst of "
        "it, because the empty structure next door is an undisturbed roost.",
        "buildings": [
            ("High-rise society towers", "Long elevation ledges and stacked AC units. "
             "These are almost always quoted per face rather than per flat."),
            ("Sector-plotted houses", "Terrace parapets, chajjas and boundary walls, "
             "usually done as one job."),
            ("Commercial blocks and IT parks", "Glass facades with cornice returns and "
             "signage that birds sit on."),
        ],
        "areas": ["Sector 62", "Sector 137", "Sector 18", "Sector 50", "Sector 76",
                  "Greater Noida West", "Noida Extension", "Sector 93"],
    },
    "gurgaon": {
        "name": "Gurgaon",
        "profile": "dusty",
        "ncr": True,
        "climate_note": "Hot, dusty and windy on the higher towers. Wind matters here "
        "more than most places, because a poorly bonded strip on a 20th-floor ledge "
        "does not stay put.",
        "bird_note": "Glass-heavy elevations give birds few natural perches, which "
        "concentrates them onto the few horizontal ledges and signage that exist.",
        "buildings": [
            ("Glass-facade towers", "Few ledges, but the ones that exist take the whole "
             "bird load. Cornice returns and mullion caps are the usual spots."),
            ("Condominium societies", "Balcony railings, chajjas and AC unit banks, "
             "typically approved and done tower by tower."),
            ("Corporate parks and warehousing on the periphery", "Canopy edges, signage "
             "and shed trusses."),
        ],
        "areas": ["DLF Phase 1-5", "Sohna Road", "Golf Course Road", "Sushant Lok",
                  "Sector 56", "MG Road", "Udyog Vihar", "New Gurgaon"],
    },
    "faridabad": {
        "name": "Faridabad",
        "profile": "dusty",
        "ncr": True,
        "climate_note": "NCR heat and dust with a heavier industrial load. In the "
        "industrial sectors there is grease in the air as well as dust, so surfaces "
        "need degreasing rather than just washing before fixing.",
        "bird_note": "Industrial sheds here are a bigger share of our work than in the "
        "residential NCR districts.",
        "buildings": [
            ("Industrial sheds and factories", "Purlins, trusses and cable trays over "
             "the working floor. Usually scheduled into a shutdown."),
            ("Sector housing", "Terrace parapets, chajjas and balcony railings."),
            ("Older colonies", "Deep window chajjas and shared stair-core openings."),
        ],
        "areas": ["Sector 15", "NIT Faridabad", "Ballabgarh", "Sector 21",
                  "Neharpar", "Old Faridabad", "Industrial Sector 24"],
    },
    "ghaziabad": {
        "name": "Ghaziabad",
        "profile": "dusty",
        "ncr": True,
        "climate_note": "Dusty and hot, with a lot of older low-rise stock where the "
        "plaster on parapet edges is chalky. That usually pushes the fixing method from "
        "adhesive to screws.",
        "bird_note": "Older buildings with weathered parapets are the common case here, "
        "and the surface often needs making good before anything is fitted.",
        "buildings": [
            ("Older low-rise colonies", "Chalky parapet edges and deep chajjas. Expect "
             "mechanical fixing rather than adhesive."),
            ("Newer societies in Indirapuram and Vaishali", "Long elevation ledges and "
             "AC unit banks."),
            ("Godowns and light industrial units", "Shed trusses and open shutter heads."),
        ],
        "areas": ["Indirapuram", "Vaishali", "Vasundhara", "Raj Nagar Extension",
                  "Kaushambi", "Crossings Republik", "Sahibabad"],
    },
    "mumbai": {
        "name": "Mumbai",
        "profile": "coastal",
        "ncr": False,
        "climate_note": "Salt air plus a monsoon that runs for months. This is the "
        "single most demanding environment we supply into, and it is the one place "
        "where using anything other than stainless is a false economy.",
        "bird_note": "High-rise chajjas and the narrow gaps between towers concentrate "
        "pigeons, and access on tall buildings makes redoing a failed install expensive.",
        "buildings": [
            ("High-rise society towers", "Chajjas at every floor and stacked AC units. "
             "Access is the cost driver, so it is worth specifying to last."),
            ("Older chawls and low-rise buildings", "Continuous ledge runs and shared "
             "balcony railings, usually done for a whole wing."),
            ("Commercial towers", "Cornices, signage and podium canopy edges."),
        ],
        "areas": ["Andheri", "Borivali", "Thane", "Navi Mumbai", "Dadar", "Powai",
                  "Malad", "Chembur", "Goregaon", "Mulund"],
    },
    "chennai": {
        "name": "Chennai",
        "profile": "coastal",
        "ncr": False,
        "climate_note": "Coastal salt with year-round heat and humidity. Anything that "
        "can rust, will — and it will do it faster than the owner expects, which is why "
        "we quote stainless here by default.",
        "bird_note": "Open sunshades and wide chajjas are common in the local building "
        "style, and both are ideal perches.",
        "buildings": [
            ("Independent houses", "Wide sunshades over every window, terrace parapets "
             "and boundary walls."),
            ("Apartment blocks", "Balcony railings, chajjas and AC unit banks on the "
             "rear elevation."),
            ("Industrial units on the outskirts", "Shed trusses and cable trays, in "
             "salt air that rules out mild steel."),
        ],
        "areas": ["Adyar", "Velachery", "Anna Nagar", "T Nagar", "OMR", "Porur",
                  "Tambaram", "Perungudi"],
    },
    "kolkata": {
        "name": "Kolkata",
        "profile": "humid",
        "ncr": False,
        "climate_note": "High humidity for most of the year and a long monsoon. "
        "Surfaces stay damp, algae grows on north-facing ledges, and adhesive needs a "
        "genuinely dry surface — which can mean waiting for the right day.",
        "bird_note": "Older buildings with deep decorative cornices give birds far more "
        "perching surface than a modern flat elevation does.",
        "buildings": [
            ("Old buildings with decorative cornices", "Mouldings, cornice bands and "
             "deep window ledges — a lot of running length on one elevation."),
            ("Apartment blocks", "Balcony railings and chajjas, plus shared light wells "
             "that usually need netting rather than spikes."),
            ("Commercial and godown space", "Truss members and open shutter heads."),
        ],
        "areas": ["Salt Lake", "New Town", "Behala", "Ballygunge", "Howrah",
                  "Jadavpur", "Dum Dum", "Rajarhat"],
    },
    "bangalore": {
        "name": "Bangalore",
        "profile": "moderate",
        "ncr": False,
        "climate_note": "The gentlest climate we supply into — moderate temperatures "
        "and no salt. Specification here is driven by how the building looks rather "
        "than by corrosion, which is why transparent polycarbonate sells well.",
        "bird_note": "Tree cover means more crows and mynahs relative to pigeons, and "
        "crows need full coverage rather than a token row.",
        "buildings": [
            ("Apartment complexes", "Balcony railings and utility-area ledges. Owners "
             "often want the spikes to be invisible from inside."),
            ("Independent houses and villas", "Terrace parapets, sunshades and compound "
             "wall tops."),
            ("Tech parks and commercial blocks", "Canopy edges, signage and podium "
             "ledges."),
        ],
        "areas": ["Whitefield", "Koramangala", "Indiranagar", "HSR Layout",
                  "Electronic City", "Jayanagar", "Hebbal", "Marathahalli"],
    },
    "hyderabad": {
        "name": "Hyderabad",
        "profile": "moderate",
        "ncr": False,
        "climate_note": "Warm and largely dry, with a short monsoon. Fixings last well "
        "here, so the decision is usually about surface width and appearance rather "
        "than material survival.",
        "bird_note": "Long parapet runs on the newer gated developments make this "
        "perimeter work more often than balcony work.",
        "buildings": [
            ("Gated community towers", "Long parapet and elevation ledge runs, quoted "
             "per block."),
            ("Independent houses", "Terrace parapets, sunshades and boundary walls."),
            ("Commercial and IT blocks", "Canopy edges, cornice returns and signage."),
        ],
        "areas": ["Gachibowli", "Madhapur", "Kondapur", "Banjara Hills", "Kukatpally",
                  "Miyapur", "Secunderabad", "LB Nagar"],
    },
    "pune": {
        "name": "Pune",
        "profile": "moderate",
        "ncr": False,
        "climate_note": "Moderate for most of the year with a strong monsoon. The rain "
        "matters more than the temperature: fit in a dry window and let the silicone "
        "cure before the next spell.",
        "bird_note": "Society balconies with utility areas at the rear are the common "
        "job, and the utility ledge is usually worse than the front balcony.",
        "buildings": [
            ("Society apartment blocks", "Front balcony railings plus rear utility "
             "ledges, which are where the nests usually are."),
            ("Row houses and bungalows", "Terrace parapets, sunshades and compound "
             "walls."),
            ("Industrial units in Pimpri-Chinchwad", "Shed trusses, cable trays and "
             "loading bay canopies."),
        ],
        "areas": ["Hinjewadi", "Kothrud", "Baner", "Wakad", "Viman Nagar",
                  "Hadapsar", "Pimpri-Chinchwad", "Kharadi"],
    },
    "ahmedabad": {
        "name": "Ahmedabad",
        "profile": "dry-hot",
        "ncr": False,
        "climate_note": "Long, very hot and dry summers. Steel is entirely comfortable "
        "here; it is untreated plastic that goes brittle after a couple of seasons of "
        "that sun.",
        "bird_note": "Wide sunshades and terrace parapets on the local building style "
        "give a lot of running length per house.",
        "buildings": [
            ("Independent houses and bungalows", "Wide sunshades, terrace parapets and "
             "compound walls."),
            ("Apartment schemes", "Balcony railings, chajjas and rear utility ledges."),
            ("Industrial estates", "Shed trusses and cable trays."),
        ],
        "areas": ["Satellite", "Bopal", "Maninagar", "Vastrapur", "SG Highway",
                  "Naranpura", "Chandkheda", "Prahlad Nagar"],
    },
    "jaipur": {
        "name": "Jaipur",
        "profile": "dry-hot",
        "ncr": False,
        "climate_note": "Dry heat with dust, and a lot of stone in the building stock. "
        "Stone takes adhesive well once it is properly cleaned, but old lime plaster on "
        "heritage-style buildings usually needs mechanical fixing.",
        "bird_note": "Decorative stonework — jharokhas, chhajjas, carved brackets — "
        "creates far more perching surface than a plain elevation, so quantities run "
        "higher than owners expect.",
        "buildings": [
            ("Heritage-style and stone buildings", "Carved brackets, jharokha ledges "
             "and deep chhajjas. High running length, and discretion matters."),
            ("Modern colonies and apartments", "Balcony railings, chajjas and terrace "
             "parapets."),
            ("Hotels and commercial property", "Canopy edges, cornices and signage, "
             "where appearance rules out visible fixings."),
        ],
        "areas": ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme",
                  "Jagatpura", "Tonk Road", "Jhotwara", "Bani Park"],
    },
    "lucknow": {
        "name": "Lucknow",
        "profile": "dry-hot",
        "ncr": False,
        "climate_note": "Hot summers, a proper monsoon and cool winters. A wide swing, "
        "though less dust-laden than NCR, so adhesive fixing is more reliable here "
        "than in Delhi.",
        "bird_note": "Older buildings with deep cornices and newer colonies with plain "
        "elevations need quite different quantities for the same floor area.",
        "buildings": [
            ("Older buildings with cornices", "Decorative bands and deep window ledges "
             "carrying a lot of running length."),
            ("Newer colonies and apartments", "Balcony railings, chajjas and terrace "
             "parapets."),
            ("Godowns and commercial units", "Shed trusses and shutter heads."),
        ],
        "areas": ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar",
                  "Alambagh", "Jankipuram", "Ashiyana", "Vikas Nagar"],
    },
    "chandigarh": {
        "name": "Chandigarh",
        "profile": "moderate",
        "ncr": False,
        "climate_note": "Hot summers and cold winters, but clean air by North Indian "
        "standards. Fixings behave predictably, and the planned building stock means "
        "quantities are unusually easy to estimate.",
        "bird_note": "Sector houses repeat the same elevation, so once one house is "
        "measured the rest of the street is the same job.",
        "buildings": [
            ("Sector houses", "Standardised sunshades, parapets and boundary walls — "
             "repeatable quantities across a whole street."),
            ("Apartment blocks in the newer sectors", "Balcony railings and chajjas."),
            ("Commercial sectors and markets", "Canopy edges, signage and cornice "
             "returns."),
        ],
        "areas": ["Sector 17", "Sector 22", "Sector 35", "Sector 43", "Mohali",
                  "Panchkula", "Zirakpur", "Manimajra"],
    },
}

# Product-specific framing for the city sections.
PRODUCTS = {
    "bird-spikes": {
        "name": "Bird Spikes",
        "lower": "bird spikes",
        "material_matters": True,
        "surface": "narrow ledges, sills, railing tops and pillar capitals",
    },
    "pigeon-spikes": {
        "name": "Pigeon Spikes",
        "lower": "pigeon spikes",
        "material_matters": True,
        "surface": "balcony railings, chajjas, parapets and AC outdoor units",
    },
    "anti-bird-net": {
        "name": "Anti Bird Net",
        "lower": "anti bird netting",
        "material_matters": False,
        "surface": "balcony openings, shafts, light wells and truss bays",
    },
    "monkey-spikes": {
        "name": "Monkey Spikes",
        "lower": "monkey spikes",
        "material_matters": True,
        "surface": "boundary walls, parapets and pipe routes",
    },
    "bird-feeders": {
        "name": "Bird Feeders",
        "lower": "bird feeders",
        "material_matters": False,
        "surface": "balconies, terraces and garden posts",
    },
}
