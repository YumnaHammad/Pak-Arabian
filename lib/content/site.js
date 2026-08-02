/**
 * Editorial content layer.
 *
 * Everything here is house narrative — copy, ingredient provenance, craft
 * chapters, testimonials. It is intentionally *not* in MongoDB: it changes with
 * the brand's story, not with inventory. Products, prices and stock continue to
 * come from the Product model.
 */

export const BRAND = {
  name: 'Pak Arabian',
  legal: 'Pak Arabian Enterprises®',
  mark: '®',
  tagline: 'Where tradition meets fine scent.',
  founded: '2019',
  city: 'Sadiqabad',
  country: 'Pakistan',
  owner: 'Abdul Rafey',
  /* As printed on the business card. */
  ownerTitle: 'Owner & CEO',
  promise: 'Purity you can trust',
  description:
    'Premium eaux de parfum inspired by the timeless heritage of Eastern fragrance. Each bottle carries a story — composed in small batches for those who wear their identity with confidence.',
};

export const CONTACT = {
  phone: '0310-1272021',
  phoneHref: 'tel:+923101272021',
  whatsapp: 'https://wa.me/923101272021',
  email: 'abdulrafeyhammad@gmail.com',
  address: {
    line1: 'Milaad Chowk, Near Allied Bank',
    line2: 'New Town, Sadiqabad',
    country: 'Punjab, Pakistan',
  },
  hours: [
    { days: 'Monday — Saturday', time: '11:00 — 21:00' },
    { days: 'Sunday', time: '15:00 — 21:00' },
  ],
  /* Google Maps query for the boutique — used by the directions link. */
  mapsQuery: 'Milaad Chowk, Near Allied Bank, New Town, Sadiqabad, Punjab, Pakistan',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com' },
    { label: 'Facebook', href: 'https://www.facebook.com' },
    { label: 'WhatsApp', href: 'https://wa.me/923101272021' },
  ],
};

/* ── Category taxonomy. `value` must match Product.category in MongoDB. ── */
export const CATEGORIES = [
  { label: 'All', value: '', blurb: 'The complete library.' },
  { label: 'Men', value: 'men', blurb: 'Structured, resinous, deliberate.' },
  { label: 'Women', value: 'women', blurb: 'Luminous florals with a shadowed base.' },
  { label: 'Unisex', value: 'unisex', blurb: 'Composed without a gender in mind.' },
  { label: 'Signature', value: 'signature', blurb: 'The house canon — our defining accords.' },
  { label: 'Woody', value: 'woody', blurb: 'Cedar, vetiver, sanded smooth.' },
  { label: 'Floral', value: 'floral', blurb: 'Petals rendered in high resolution.' },
];

/* ── The four doors on the homepage collections section ── */
export const COLLECTION_DOORS = [
  {
    value: 'men',
    label: 'Men',
    numeral: 'I',
    line: 'Ironwood, incense, dry leather.',
    accent: '#3B402C',
  },
  {
    value: 'women',
    label: 'Women',
    numeral: 'II',
    line: 'Bulgarian rose at midnight.',
    accent: '#6B3F4A',
  },
  {
    value: 'unisex',
    label: 'Unisex',
    numeral: 'III',
    line: 'Skin, musk, quiet radiance.',
    accent: '#2F4A46',
  },
  {
    value: 'signature',
    label: 'Signature',
    numeral: 'IV',
    line: 'The house canon. Small batch, numbered.',
    accent: '#8C6B2F',
  },
];

/* ════════════════════════════════════════════════════════════
   HOUSE STORY
   ════════════════════════════════════════════════════════════ */
export const HOUSE_STORY = {
  eyebrow: 'The House',
  title: 'A perfumery built on patience.',
  lede:
    'Pak Arabian began in a single room in Sadiqabad with a set of brass funnels, a maceration cabinet, and a conviction that the East had been supplying the world’s great houses with raw material for centuries without ever signing its own name to the bottle.',
  columns: [
    {
      heading: 'Origin',
      body:
        'We began sourcing directly — oud from the Laos highlands, rose from the Valley of Roses, orris from Florentine growers who wait three years before the root is even touched. No middlemen, no reconstituted shortcuts.',
    },
    {
      heading: 'Method',
      body:
        'Every composition macerates for a minimum of eight weeks before it is filtered. It is the slowest, least commercial step in perfumery, and it is the reason our openings never smell like alcohol.',
    },
    {
      heading: 'Intent',
      body:
        'We release four to six compositions a year. Each one has to earn its place in the library, or it does not leave the bench. Restraint is the whole discipline.',
    },
  ],
  pull:
    'A fragrance should not announce you at the door. It should be the reason someone turns around after you have already passed.',
  attribution: 'Abdul Rafey, Founder',
};

/* ════════════════════════════════════════════════════════════
   INGREDIENTS — coordinates drive the origin map
   x/y are percentages on the decorative world plate
   ════════════════════════════════════════════════════════════ */
export const INGREDIENTS = [
  {
    id: 'oud',
    name: 'Oud',
    latin: 'Aquilaria crassna',
    origin: 'Laos Highlands',
    family: 'Resinous',
    x: 74, y: 47,
    note: 'Base',
    blurb:
      'Formed only when the Aquilaria tree is wounded and answers with resin. Fifteen years of injury compressed into a single dark, animalic breath.',
    hue: '#5A3A1E',
  },
  {
    id: 'rose',
    name: 'Bulgarian Rose',
    latin: 'Rosa damascena',
    origin: 'Valley of Roses',
    family: 'Floral',
    x: 54, y: 34,
    note: 'Heart',
    blurb:
      'Harvested between four and nine in the morning, before the sun takes the oil. Four thousand kilograms of petals yield a single kilogram of absolute.',
    hue: '#7A2E43',
  },
  {
    id: 'orris',
    name: 'Orris Root',
    latin: 'Iris pallida',
    origin: 'Tuscany',
    family: 'Powdery',
    x: 49, y: 33,
    note: 'Heart',
    blurb:
      'The rhizome is lifted, dried, and then left alone for three years. Only then does it turn violet, suede and cold silk. The most expensive material in the cabinet.',
    hue: '#8E86A8',
  },
  {
    id: 'sandalwood',
    name: 'Sandalwood',
    latin: 'Santalum album',
    origin: 'Mysore',
    family: 'Woody',
    x: 70, y: 54,
    note: 'Base',
    blurb:
      'Thirty years before the heartwood is worth distilling. Creamy, lactonic, and quietly immovable — the spine beneath half the library.',
    hue: '#B08A5A',
  },
  {
    id: 'bergamot',
    name: 'Calabrian Bergamot',
    latin: 'Citrus bergamia',
    origin: 'Reggio Calabria',
    family: 'Citrus',
    x: 52, y: 37,
    note: 'Top',
    blurb:
      'Cold-pressed from the rind within hours of picking. It gives the first eight minutes of a fragrance its light — and then, correctly, disappears.',
    hue: '#9BA84E',
  },
  {
    id: 'saffron',
    name: 'Saffron',
    latin: 'Crocus sativus',
    origin: 'Khorasan',
    family: 'Spice',
    x: 64, y: 40,
    note: 'Top',
    blurb:
      'Each flower offers three crimson threads, picked by hand at dawn. Leathery, faintly medicinal, and the traditional bridge between rose and oud.',
    hue: '#C1621F',
  },
  {
    id: 'vetiver',
    name: 'Haitian Vetiver',
    latin: 'Chrysopogon zizanioides',
    origin: 'Les Cayes',
    family: 'Woody',
    x: 27, y: 51,
    note: 'Base',
    blurb:
      'The root, not the grass. Washed, sun-dried, then steam-distilled into something smoky, mineral and grey — the smell of earth after it has been cut.',
    hue: '#4C5B3C',
  },
  {
    id: 'amber',
    name: 'Labdanum',
    latin: 'Cistus ladanifer',
    origin: 'Andalusia',
    family: 'Amber',
    x: 45, y: 39,
    note: 'Base',
    blurb:
      'Combed from the fleece of goats grazing the rockrose hills, as it has been gathered since antiquity. Warm, balsamic, and faintly like sun-heated skin.',
    hue: '#8A5A24',
  },
];

/* ════════════════════════════════════════════════════════════
   CRAFT — the timeline section
   ════════════════════════════════════════════════════════════ */
export const CRAFT_CHAPTERS = [
  {
    numeral: 'I',
    title: 'Sourcing',
    duration: 'Ongoing',
    body:
      'Growers are visited, not emailed. We buy a season ahead and accept the harvest we are given — a difficult rose year changes the composition, and we let it.',
  },
  {
    numeral: 'II',
    title: 'Composition',
    duration: '6 — 14 months',
    body:
      'A formula begins as forty materials and ends as nineteen. The work is subtraction. Trials are numbered, dated, and set aside for weeks before being smelled again.',
  },
  {
    numeral: 'III',
    title: 'Maceration',
    duration: '8 weeks minimum',
    body:
      'The concentrate marries with the alcohol in darkness at a steady sixteen degrees. Nothing is stirred, nothing is hurried. The harshness leaves on its own.',
  },
  {
    numeral: 'IV',
    title: 'Filtration',
    duration: '72 hours',
    body:
      'Chilled below zero, then passed through a fine filter to lift any wax the naturals left behind. It is what makes the liquid read as clear as water in the bottle.',
  },
  {
    numeral: 'V',
    title: 'Bottling',
    duration: 'By hand',
    body:
      'Filled, crimped and weighed one at a time. Each bottle is checked against a reference sample before its collar goes on. Batches are small enough to count.',
  },
  {
    numeral: 'VI',
    title: 'Presentation',
    duration: 'Final',
    body:
      'Wrapped in unbleached tissue, sealed with wax, and boxed in board pressed from recycled cotton. The unboxing is the first minute of the fragrance.',
  },
];

/* ════════════════════════════════════════════════════════════
   TESTIMONIALS
   ════════════════════════════════════════════════════════════ */
export const TESTIMONIALS = [
  {
    quote:
      'I have worn French houses for twenty years. Bois de Fer is the first thing in a decade that made a stranger stop me in a lift to ask what it was.',
    name: 'Hassan Iqbal',
    location: 'Lahore',
    rating: 5,
    product: 'Bois de Fer',
  },
  {
    quote:
      'Rose Eternelle does not smell like a rose candle, which is the entire problem with rose fragrances. It smells like the flower an hour after it has been cut.',
    name: 'Ayesha Siddiqui',
    location: 'Karachi',
    rating: 5,
    product: 'Rose Eternelle',
  },
  {
    quote:
      'Eleven hours on skin in Karachi humidity. I have paid four times as much for half the performance.',
    name: 'Bilal Ahmed',
    location: 'Karachi',
    rating: 5,
    product: 'Oud Majeste',
  },
  {
    quote:
      'The packaging arrived sealed in wax. My husband thought I had ordered from Paris. I let him keep thinking it for a week.',
    name: 'Fatima Noor',
    location: 'Islamabad',
    rating: 5,
    product: 'Iris Pale',
  },
  {
    quote:
      'Musc Sacre is the one I reach for when I do not want to smell of anything except better skin. That is harder to compose than it sounds.',
    name: 'Zainab Malik',
    location: 'Rawalpindi',
    rating: 5,
    product: 'Musc Sacre',
  },
  {
    quote:
      'I ordered on a Tuesday and it was at my door on Thursday, wrapped like a gift I had not paid for. The scent was almost secondary.',
    name: 'Usman Tariq',
    location: 'Multan',
    rating: 5,
    product: 'Acqua Nobile',
  },
];

/* ════════════════════════════════════════════════════════════
   ABOUT — house chronology & values
   ════════════════════════════════════════════════════════════ */
export const CHRONOLOGY = [
  {
    year: '2019',
    title: 'One room, four formulas',
    body:
      'Abdul Rafey begins compounding in a single room in New Town, Sadiqabad. The first four formulas are given away to friends for a year before anything is sold.',
  },
  {
    year: '2021',
    title: 'Direct sourcing',
    body:
      'The house stops buying through distributors. First direct contracts are signed for Laotian oud and Khorasan saffron.',
  },
  {
    year: '2022',
    title: 'The maceration cabinet',
    body:
      'A temperature-held cabinet is built to hold eight weeks of stock at sixteen degrees. Output halves. Quality does not.',
  },
  {
    year: '2024',
    title: 'The Signature library',
    body:
      'Noir Ambre, Oud Majeste and Musc Sacre are formalised as the house canon — the three accords everything else is measured against.',
  },
  {
    year: '2026',
    title: 'Beyond the counter',
    body:
      'The full library opens online, shipped nationwide from Sadiqabad in small numbered batches.',
  },
];

export const VALUES = [
  {
    title: 'Small batch, always',
    body:
      'We would rather sell out than scale a formula past the point where one person can still check every bottle.',
  },
  {
    title: 'Naturals where they matter',
    body:
      'Synthetics are used deliberately — for longevity, for materials that cannot be ethically harvested — never to cheapen a heart note.',
  },
  {
    title: 'Honest concentration',
    body:
      'When the label reads Eau de Parfum, the oil load matches it. No eau de toilette sold at parfum pricing.',
  },
  {
    title: 'Priced from Sadiqabad',
    body:
      'We are not importing a French markup. You pay for the materials and the time, not for a boulevard address.',
  },
];

/* ════════════════════════════════════════════════════════════
   FAQ
   ════════════════════════════════════════════════════════════ */
export const FAQ_GROUPS = [
  {
    group: 'Fragrance',
    items: [
      {
        q: 'How long will a Pak Arabian fragrance last on skin?',
        a: 'Our eaux de parfum carry an 18–22% oil concentration, which typically gives eight to twelve hours on skin. Resinous compositions such as Oud Majeste and Noir Ambre routinely run longer; citrus-led openings like Acqua Nobile project hardest in the first three hours.',
      },
      {
        q: 'What is the difference between top, heart and base notes?',
        a: 'Top notes are what you smell in the first ten minutes — bright, volatile, and designed to leave. The heart emerges around twenty minutes and carries the character of the composition. The base appears after an hour and is what remains on fabric the next morning.',
      },
      {
        q: 'Why does the same fragrance smell different on me?',
        a: 'Skin pH, temperature and hydration all shift how a composition unfolds. Warmer, oilier skin amplifies base notes and shortens the top. We recommend testing on skin for a full hour before deciding.',
      },
      {
        q: 'How should I store my bottle?',
        a: 'Away from light, heat and humidity — a drawer, not a bathroom shelf or a windowsill. Stored properly, an unopened bottle holds for five years and an opened one for two to three.',
      },
    ],
  },
  {
    group: 'Orders & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Orders leave Sadiqabad within one working day. Delivery is typically two to four working days nationwide, and next-day within Punjab for orders placed before noon.',
      },
      {
        q: 'How do I pay?',
        a: 'Orders are currently placed on a cash-on-delivery basis. You confirm the order here, and payment is collected when the parcel reaches you.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes. Your confirmation page carries an order reference, and you can view live status from your account. For anything urgent, WhatsApp us on 0310-1272021.',
      },
      {
        q: 'Do you ship outside Pakistan?',
        a: 'Not through the site yet. For international requests, message us directly on WhatsApp and we will quote a courier rate.',
      },
    ],
  },
  {
    group: 'Returns & Care',
    items: [
      {
        q: 'Can I return a fragrance?',
        a: 'Sealed, unopened bottles can be returned within fourteen days of delivery. Because fragrance is applied to skin, we cannot accept opened bottles unless the product is faulty.',
      },
      {
        q: 'My bottle arrived damaged. What now?',
        a: 'Photograph the parcel and the bottle and send both to us on WhatsApp within forty-eight hours. We replace breakage in transit at no cost, no questions asked.',
      },
      {
        q: 'Do you offer samples?',
        a: 'Two-millilitre samples of any composition are available on request when you order. Message us with your order reference and we will include them.',
      },
    ],
  },
];

/* ════════════════════════════════════════════════════════════
   PLAIN-LANGUAGE COMMERCE COPY
   Everything above this line is the house narrative. Everything below
   answers the four questions a first-time shopper actually has:
   what is this, what does it cost, can I trust you, how do I buy.
   ════════════════════════════════════════════════════════════ */

/** One-sentence answer to "what is this shop?" — used in the hero. */
export const PITCH = {
  headline: 'Original perfumes,',
  headlineAccent: 'made in Pakistan.',
  sub: `Long-lasting eau de parfum bottled by hand in ${BRAND.city}. Pay cash when it reaches your door — nothing upfront.`,
  priceFrom: 6500,
};

/** The bar directly under the hero. Short enough to read at a glance. */
export const VALUE_PROPS = [
  {
    title: 'Cash on delivery',
    body: 'Pay the courier when your parcel arrives. No card needed.',
    icon: 'wallet',
  },
  {
    title: 'Delivery in 2–4 days',
    body: 'Anywhere in Pakistan. Next-day across Punjab.',
    icon: 'truck',
  },
  {
    title: '8–12 hours on skin',
    body: '18–22% oil concentration — a real eau de parfum.',
    icon: 'clock',
  },
  {
    title: '14-day returns',
    body: 'Sealed bottles can be sent back, no questions.',
    icon: 'shield',
  },
];

/** Three steps, so ordering never feels uncertain. */
export const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Pick your fragrance',
    body: 'Browse by Men, Women or Unisex. Every bottle shows its price and how many are left in stock.',
  },
  {
    step: '2',
    title: 'Place the order',
    body: 'Add to bag and enter your name, phone and address. No account needed, no card details.',
  },
  {
    step: '3',
    title: 'Pay when it arrives',
    body: 'We despatch within one working day. Hand the cash to the courier at your door.',
  },
];

/** The four questions asked most often, answered on the homepage. */
export const QUICK_ANSWERS = [
  {
    q: 'How do I pay?',
    a: 'Cash to the courier when your parcel arrives. You are not charged anything when you place the order.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Two to four working days anywhere in Pakistan, and next-day within Punjab for orders placed before noon.',
  },
  {
    q: 'How long does the scent last?',
    a: 'Eight to twelve hours on skin. Ours are eau de parfum at 18–22% oil, not the weaker eau de toilette sold at the same price elsewhere.',
  },
  {
    q: 'What if I do not like it?',
    a: 'Send a sealed, unopened bottle back within fourteen days and we refund it. Damaged in transit? We replace it free.',
  },
];

/* ── Trust row shown on product and checkout ── */
export const ASSURANCES = [
  { title: 'Small batch', body: 'Bottled and checked by hand in Sadiqabad.' },
  { title: 'Directly sourced', body: 'Materials bought from growers, not brokers.' },
  { title: 'Sealed on despatch', body: 'Wax-sealed and boxed for transit.' },
  { title: 'Cash on delivery', body: 'Pay when the parcel reaches your door.' },
];
