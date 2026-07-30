import { z } from "zod";
import { GAMES, PLAYSTYLES, REGIONS, drugsApplies } from "./taxonomy";
import type { ListingInput } from "./types";

/** Only http(s) — a listing must never be able to inject a javascript: URL. */
const httpUrl = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Enter a full URL starting with https://" }
  );

const optionalHttpUrl = z
  .union([httpUrl, z.literal("")])
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .default(null);

/**
 * The uploader returns one of two shapes:
 *   production — a short https:// URL from Vercel Blob
 *   local dev  — a `data:image/…;base64,` URL, because no blob store is configured
 *
 * Both are accepted; everything else is rejected, so a hand-crafted POST cannot
 * put an arbitrary scheme into an <img src>. The data: branch gets a 6 MB
 * ceiling (base64 inflates the 4 MB upload limit by about a third).
 */
const DATA_IMAGE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

const imageUrlField = z
  .string()
  .trim()
  .nullable()
  .default(null)
  .superRefine((value, ctx) => {
    if (value === null || value === "") return;

    if (value.startsWith("data:")) {
      if (!DATA_IMAGE.test(value)) {
        ctx.addIssue({ code: "custom", message: "That image data was not readable." });
      } else if (value.length > 6_000_000) {
        ctx.addIssue({ code: "custom", message: "That picture is too large. Use one under 4 MB." });
      }
      return;
    }

    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        ctx.addIssue({ code: "custom", message: "The picture must be served over https." });
      } else if (value.length > 600) {
        ctx.addIssue({ code: "custom", message: "That image address is too long." });
      }
    } catch {
      ctx.addIssue({ code: "custom", message: "That picture could not be attached. Upload it again." });
    }
  })
  .transform((value) => (value === "" ? null : value));

export const listingSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Give the server a name of at least 3 characters.")
      .max(60, "Server names are capped at 60 characters."),
    tagline: z
      .string()
      .trim()
      .min(10, "Write a one-line summary of at least 10 characters.")
      .max(120, "Keep the one-liner under 120 characters."),
    description: z
      .string()
      .trim()
      .min(80, "Describe the server in at least 80 characters — players read this before they join.")
      .max(6000, "Descriptions are capped at 6000 characters."),
    game: z.enum(GAMES),
    region: z.enum(REGIONS),
    playstyle: z.enum(PLAYSTYLES),
    pvp: z.coerce.boolean().default(false),
    drugs: z.coerce.boolean().nullable().default(null),
    avgPlayers: z.coerce
      .number()
      .int("Average players must be a whole number.")
      .min(0, "Average players cannot be negative.")
      .max(100000, "That average player count is not plausible."),
    maxPlayers: z.coerce
      .number()
      .int()
      .min(1)
      .max(100000)
      .nullable()
      .default(null),
    imageUrl: imageUrlField,
    imageAlt: z.string().trim().max(160).nullable().default(null),
    connectUrl: z.string().trim().max(200).nullable().default(null),
    websiteUrl: optionalHttpUrl,
    discordUrl: optionalHttpUrl,
  })
  .superRefine((value, ctx) => {
    if (value.maxPlayers !== null && value.avgPlayers > value.maxPlayers) {
      ctx.addIssue({
        code: "custom",
        path: ["avgPlayers"],
        message: "Average players cannot exceed the slot count.",
      });
    }
  })
  /**
   * The drugs question belongs to FiveM. Anything that arrives for another game
   * is dropped here rather than in the UI, so a hand-crafted POST can't set it.
   */
  .transform((value): ListingInput => ({
    ...value,
    drugs: drugsApplies(value.game) ? Boolean(value.drugs) : null,
  }));

export type ListingFormErrors = Partial<Record<string, string>>;

/** Flattens Zod issues into one message per field, which is what the form renders. */
export function fieldErrors(error: z.ZodError): ListingFormErrors {
  const out: ListingFormErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** FormData gives strings; checkboxes are absent when unchecked. */
export function formDataToListing(form: FormData) {
  const str = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  };

  return {
    name: str("name") ?? "",
    tagline: str("tagline") ?? "",
    description: str("description") ?? "",
    game: str("game") ?? "",
    region: str("region") ?? "",
    playstyle: str("playstyle") ?? "",
    pvp: form.get("pvp") === "on" || form.get("pvp") === "true",
    drugs: form.get("drugs") === "on" || form.get("drugs") === "true",
    avgPlayers: str("avgPlayers") ?? "",
    maxPlayers: str("maxPlayers"),
    imageUrl: str("imageUrl"),
    imageAlt: str("imageAlt"),
    connectUrl: str("connectUrl"),
    websiteUrl: str("websiteUrl") ?? "",
    discordUrl: str("discordUrl") ?? "",
  };
}
