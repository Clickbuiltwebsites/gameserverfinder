import type { Game, Playstyle, Region } from "./taxonomy";

export type ListingStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export type Listing = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  game: Game;
  region: Region;
  playstyle: Playstyle;
  pvp: boolean;
  /** FiveM-only. `null` means "the question doesn't apply to this game". */
  drugs: boolean | null;
  avgPlayers: number;
  maxPlayers: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  connectUrl: string | null;
  websiteUrl: string | null;
  discordUrl: string | null;
  status: ListingStatus;
  createdAt: string;
  ownerId: string;
  ownerName: string | null;
};

export type ListingQuery = {
  games?: Game[];
  regions?: Region[];
  playstyles?: Playstyle[];
  /** `true` = PvP only, `false` = PvE only, undefined = don't filter. */
  pvp?: boolean;
  drugs?: boolean;
  q?: string;
  sort?: "newest" | "players";
  take?: number;
};

export type ListingInput = {
  name: string;
  tagline: string;
  description: string;
  game: Game;
  region: Region;
  playstyle: Playstyle;
  pvp: boolean;
  drugs: boolean | null;
  avgPlayers: number;
  maxPlayers: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  connectUrl: string | null;
  websiteUrl: string | null;
  discordUrl: string | null;
};

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  /** True when the session came from the dev-only demo fallback. */
  demo: boolean;
};
