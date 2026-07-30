import type { Listing } from "./types";

/**
 * Sample listings. Used two ways:
 *   1. `prisma/seed.ts` writes them into a real database.
 *   2. The dev-only in-memory repo serves them when DATABASE_URL is unset, so a
 *      fresh clone renders a populated site before anyone provisions Postgres.
 *
 * The cover art is hand-built SVG in /public/covers — deliberately abstract, so
 * nobody mistakes it for a real screenshot of the server.
 */
export const DEMO_LISTINGS: Listing[] = [
  {
    id: "seed-ashfall",
    slug: "ashfall-roleplay",
    name: "Ashfall Roleplay",
    tagline: "Whitelisted city RP with a working court system.",
    description: `Ashfall runs a single city with about 180 slots and a whitelist you clear over a voice interview. We are not a shooter with a police department bolted on — if you pull a gun here you will spend the next two weeks of server time dealing with what that did.

The legal economy is the spine: eleven jobs, a tax system, and a court that actually convenes. Criminal play exists and is supported, but it moves slowly and it has consequences that stick to your character.

New applicants: read the pinned document before you apply. Roughly half of rejections are people who did not.`,
    game: "FIVEM",
    region: "US",
    playstyle: "SERIOUS_RP",
    pvp: true,
    drugs: true,
    avgPlayers: 142,
    maxPlayers: 180,
    imageUrl: "/covers/fivem.svg",
    imageAlt: "Abstract city grid at night with light trails along the avenues",
    connectUrl: "cfx.re/join/ashfall",
    websiteUrl: "https://example.com/ashfall",
    discordUrl: "https://discord.gg/example-ashfall",
    status: "PUBLISHED",
    createdAt: "2026-07-24T18:12:00.000Z",
    ownerId: "seed-user-1",
    ownerName: "Maya Okonkwo",
  },
  {
    id: "seed-kingsway",
    slug: "kingsway-city-rp",
    name: "Kingsway City RP",
    tagline: "London-set roleplay on UK hours. No drug economy.",
    description: `Kingsway is a UK server on UK time — peak is 7pm to midnight GMT and the staff are awake for it. The map is a reworked city with British signage, right-hand drive, and an armed-response unit that is deliberately rare.

We removed the drug economy entirely in March. It kept collapsing the rest of the city into a supply chain simulator, and the people who stayed did not want that. Money comes from jobs, haulage contracts, and property.

Semi-serious: stay in character, but nobody is going to remove you for laughing.`,
    game: "FIVEM",
    region: "UK",
    playstyle: "SEMI_SERIOUS_RP",
    pvp: false,
    drugs: false,
    avgPlayers: 88,
    maxPlayers: 128,
    imageUrl: "/covers/fivem.svg",
    imageAlt: "Abstract city grid at night with light trails along the avenues",
    connectUrl: "cfx.re/join/kingsway",
    websiteUrl: null,
    discordUrl: "https://discord.gg/example-kingsway",
    status: "PUBLISHED",
    createdAt: "2026-07-20T09:40:00.000Z",
    ownerId: "seed-user-2",
    ownerName: "Sam Tan",
  },
  {
    id: "seed-northside",
    slug: "northside-division",
    name: "Northside Division",
    tagline: "Gang-focused FiveM. Fast, loud, and openly a shooter.",
    description: `Northside does not pretend to be a roleplay server. It is a shooter with a city attached. Turf resets Sunday at midnight, gangs cap at twelve, and the whole map is hot.

Drug running is the main income loop and we are not shy about it — routes, corners, labs, the lot. If that is not what you are looking for, Kingsway or Ashfall will suit you better and we would genuinely rather you went there.

Bring a crew. Solos have a rough time here and we are not going to pretend otherwise.`,
    game: "FIVEM",
    region: "US",
    playstyle: "SHOOTER",
    pvp: true,
    drugs: true,
    avgPlayers: 96,
    maxPlayers: 150,
    imageUrl: "/covers/fivem.svg",
    imageAlt: "Abstract city grid at night with light trails along the avenues",
    connectUrl: "cfx.re/join/northside",
    websiteUrl: null,
    discordUrl: "https://discord.gg/example-northside",
    status: "PUBLISHED",
    createdAt: "2026-07-28T21:05:00.000Z",
    ownerId: "seed-user-1",
    ownerName: "Maya Okonkwo",
  },
  {
    id: "seed-blackout",
    slug: "blackout-chernarus",
    name: "Blackout Chernarus",
    tagline: "Vanilla loot, night cycles that actually go dark.",
    description: `No boosted loot, no traders, no base-building mods. Chernarus as shipped, with a night cycle we refuse to brighten. Bring a torch and learn to use the moon.

Roughly 60 players on a good evening, mostly European and US-east. KOS is permitted everywhere except the two documented safe zones, which are marked on the map in Discord.

We wipe twice a year and announce it a month out.`,
    game: "DAYZ",
    region: "US",
    playstyle: "SURVIVAL",
    pvp: true,
    drugs: null,
    avgPlayers: 54,
    maxPlayers: 60,
    imageUrl: "/covers/dayz.svg",
    imageAlt: "Abstract cold horizon with pine silhouettes and fog bands",
    connectUrl: "203.0.113.24:2302",
    websiteUrl: null,
    discordUrl: "https://discord.gg/example-blackout",
    status: "PUBLISHED",
    createdAt: "2026-07-11T14:30:00.000Z",
    ownerId: "seed-user-3",
    ownerName: "Elena Ruiz",
  },
  {
    id: "seed-greenmountain",
    slug: "green-mountain-exiles",
    name: "Green Mountain Exiles",
    tagline: "Livonia RP. Every gunfight has to be talked into first.",
    description: `An RP-first DayZ server on Livonia. The rule is simple and strictly enforced: you initiate verbally before you shoot, and you give the other person a real chance to respond.

Factions are player-run and registered with staff. There are three at the moment — a medical group at Tarnow, a trader collective, and whatever the people at the Nadbor railyard are currently calling themselves.

UK and EU hours. Around 40 regulars.`,
    game: "DAYZ",
    region: "UK",
    playstyle: "SERIOUS_RP",
    pvp: true,
    drugs: null,
    avgPlayers: 38,
    maxPlayers: 50,
    imageUrl: "/covers/dayz.svg",
    imageAlt: "Abstract cold horizon with pine silhouettes and fog bands",
    connectUrl: "198.51.100.9:2302",
    websiteUrl: "https://example.com/greenmountain",
    discordUrl: "https://discord.gg/example-greenmountain",
    status: "PUBLISHED",
    createdAt: "2026-07-26T11:00:00.000Z",
    ownerId: "seed-user-3",
    ownerName: "Elena Ruiz",
  },
  {
    id: "seed-coppercoast",
    slug: "copper-coast-smp",
    name: "Copper Coast SMP",
    tagline: "Six-year-old survival map. Grief once and you are gone.",
    description: `A vanilla-plus survival world that has been running since 2020. The spawn town is entirely player-built and the rail network reaches about 9,000 blocks in every direction.

No claims plugin. We run on trust and a very short rule list, and it has held for six years because we remove griefers on the first offence without argument.

Whitelist via the Discord. Expect to answer three questions.`,
    game: "MINECRAFT",
    region: "UK",
    playstyle: "CASUAL",
    pvp: false,
    drugs: null,
    avgPlayers: 27,
    maxPlayers: 80,
    imageUrl: "/covers/minecraft.svg",
    imageAlt: "Abstract isometric stack of blocks in warm and cool tones",
    connectUrl: "play.example-coppercoast.net",
    websiteUrl: "https://example.com/coppercoast",
    discordUrl: "https://discord.gg/example-coppercoast",
    status: "PUBLISHED",
    createdAt: "2026-06-30T08:15:00.000Z",
    ownerId: "seed-user-4",
    ownerName: "Devon Marsh",
  },
  {
    id: "seed-bastion",
    slug: "bastion-anarchy",
    name: "Bastion Anarchy",
    tagline: "No rules, no resets, no admins in your business.",
    description: `Anarchy in the old sense. The world has never been reset, spawn is a crater, and the only thing we enforce is a client-side cheat ban.

Everything else — griefing, betrayal, the lag machines people keep building near spawn — is the server. If that sounds exhausting, it is, and that is the appeal.

Java only. No whitelist. Queue can be long on weekends.`,
    game: "MINECRAFT",
    region: "US",
    playstyle: "SHOOTER",
    pvp: true,
    drugs: null,
    avgPlayers: 210,
    maxPlayers: 400,
    imageUrl: "/covers/minecraft.svg",
    imageAlt: "Abstract isometric stack of blocks in warm and cool tones",
    connectUrl: "play.example-bastion.net",
    websiteUrl: null,
    discordUrl: "https://discord.gg/example-bastion",
    status: "PUBLISHED",
    createdAt: "2026-07-29T16:45:00.000Z",
    ownerId: "seed-user-4",
    ownerName: "Devon Marsh",
  },
  {
    id: "seed-ironworks",
    slug: "ironworks-2x",
    name: "Ironworks 2x",
    tagline: "Thursday wipes, 2x gather, no VIP queue for sale.",
    description: `2x gather, 2x components, vanilla everything else. We wipe Thursdays at 2pm Eastern and BP-wipe on the first Thursday of the month.

There is no paid queue skip and there never will be. The only thing money buys here is nothing, because we do not sell anything.

Group limit is four, enforced by admins who actually check. Roughly 120 on wipe day, half that midweek.`,
    game: "RUST",
    region: "US",
    playstyle: "SHOOTER",
    pvp: true,
    drugs: null,
    avgPlayers: 118,
    maxPlayers: 200,
    imageUrl: "/covers/rust.svg",
    imageAlt: "Abstract riveted metal plates in rust and ember tones",
    connectUrl: "client.connect 192.0.2.51:28015",
    websiteUrl: null,
    discordUrl: "https://discord.gg/example-ironworks",
    status: "PUBLISHED",
    createdAt: "2026-07-27T13:20:00.000Z",
    ownerId: "seed-user-2",
    ownerName: "Sam Tan",
  },
  {
    id: "seed-tidewater",
    slug: "tidewater-solo-duo",
    name: "Tidewater Solo / Duo",
    tagline: "UK-hosted, strictly solo or duo, vanilla rates.",
    description: `Solo and duo only, and we enforce it — teaming past two is a ban, not a warning. Vanilla rates, monthly wipe, 3,000-size map so you can actually find people.

Hosted in London, so UK and EU ping is good and US-east is playable. Peak is around 70 in the evening.

If you are looking for a big-group server this is the wrong listing.`,
    game: "RUST",
    region: "UK",
    playstyle: "SURVIVAL",
    pvp: true,
    drugs: null,
    avgPlayers: 62,
    maxPlayers: 100,
    imageUrl: "/covers/rust.svg",
    imageAlt: "Abstract riveted metal plates in rust and ember tones",
    connectUrl: "client.connect 198.51.100.77:28015",
    websiteUrl: "https://example.com/tidewater",
    discordUrl: "https://discord.gg/example-tidewater",
    status: "PUBLISHED",
    createdAt: "2026-07-18T19:55:00.000Z",
    ownerId: "seed-user-2",
    ownerName: "Sam Tan",
  },
];

export const DEMO_USERS = [
  { id: "seed-user-1", name: "Maya Okonkwo", email: "maya@example.com" },
  { id: "seed-user-2", name: "Sam Tan", email: "sam@example.com" },
  { id: "seed-user-3", name: "Elena Ruiz", email: "elena@example.com" },
  { id: "seed-user-4", name: "Devon Marsh", email: "devon@example.com" },
];
