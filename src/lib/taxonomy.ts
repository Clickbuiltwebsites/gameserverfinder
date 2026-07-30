/**
 * The vocabulary of a listing: games, regions, playstyles, and the two booleans.
 * Every label the UI shows comes from here so the browse filters, the submit
 * form, and the detail page can never drift apart.
 */

export const GAMES = ["DAYZ", "FIVEM", "MINECRAFT", "RUST"] as const;
export type Game = (typeof GAMES)[number];

export const REGIONS = ["US", "UK", "EU", "OTHER"] as const;
export type Region = (typeof REGIONS)[number];

export const PLAYSTYLES = [
  "SERIOUS_RP",
  "SEMI_SERIOUS_RP",
  "SHOOTER",
  "SURVIVAL",
  "CASUAL",
] as const;
export type Playstyle = (typeof PLAYSTYLES)[number];

export const GAME_LABEL: Record<Game, string> = {
  DAYZ: "DayZ",
  FIVEM: "FiveM",
  MINECRAFT: "Minecraft",
  RUST: "Rust",
};

export const GAME_BLURB: Record<Game, string> = {
  DAYZ: "Chernarus and Livonia. Loot, thirst, and the other guy.",
  FIVEM: "GTA V roleplay. Cities with jobs, courts, and traffic laws.",
  MINECRAFT: "SMP, anarchy, skyblock, modded. Build or raid.",
  RUST: "Wipe cycles, raids, and the long walk back to your base.",
};

export const REGION_LABEL: Record<Region, string> = {
  US: "US",
  UK: "UK",
  EU: "EU",
  OTHER: "Other",
};

export const REGION_LONG: Record<Region, string> = {
  US: "United States",
  UK: "United Kingdom",
  EU: "Europe",
  OTHER: "Elsewhere",
};

export const PLAYSTYLE_LABEL: Record<Playstyle, string> = {
  SERIOUS_RP: "Serious RP",
  SEMI_SERIOUS_RP: "Semi-serious RP",
  SHOOTER: "Shooter",
  SURVIVAL: "Survival",
  CASUAL: "Casual",
};

export const PLAYSTYLE_HINT: Record<Playstyle, string> = {
  SERIOUS_RP: "Stay in character. Breaking it gets you removed.",
  SEMI_SERIOUS_RP: "Roleplay is the frame, but nobody is going to ban you for a joke.",
  SHOOTER: "Combat first. The story is whatever happened in the last firefight.",
  SURVIVAL: "The map is the antagonist. PvP is weather, not the point.",
  CASUAL: "Log in, mess about, log out.",
};

/** The drugs question is a FiveM economy question. It doesn't apply elsewhere. */
export const DRUGS_APPLIES_TO: readonly Game[] = ["FIVEM"];

export function drugsApplies(game: Game): boolean {
  return DRUGS_APPLIES_TO.includes(game);
}

export function isGame(value: unknown): value is Game {
  return typeof value === "string" && (GAMES as readonly string[]).includes(value);
}

export function isRegion(value: unknown): value is Region {
  return typeof value === "string" && (REGIONS as readonly string[]).includes(value);
}

export function isPlaystyle(value: unknown): value is Playstyle {
  return typeof value === "string" && (PLAYSTYLES as readonly string[]).includes(value);
}

/** Player counts are always rendered through this so 1200 never shows as "1200". */
export function formatPlayers(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
