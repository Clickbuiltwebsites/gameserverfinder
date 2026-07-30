import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/session";
import { DEMO_MODE } from "@/lib/repo";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB — comfortably under the 4.5 MB body limit
const ALLOWED = new Map<string, string>([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

/** Magic bytes, because the client-declared MIME type is a suggestion. */
function sniff(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in before uploading a picture.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("That upload was not readable. Try the file again.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file arrived with the request.", 400);

  if (file.size === 0) return fail("That file is empty.", 400);
  if (file.size > MAX_BYTES) {
    return fail("Server pictures are capped at 4 MB. Resize it and try again.", 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniff(bytes);
  if (!sniffed || !ALLOWED.has(sniffed)) {
    return fail("Upload a PNG, JPEG, or WebP image.", 415);
  }

  const extension = ALLOWED.get(sniffed)!;

  // Production path: Vercel Blob.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const key = `listings/${user.id}/${crypto.randomUUID()}.${extension}`;
    const blob = await put(key, Buffer.from(bytes), {
      access: "public",
      contentType: sniffed,
      addRandomSuffix: false,
    });
    return Response.json({ url: blob.url, contentType: sniffed });
  }

  // Dev path: no blob store configured. Hand back a data URL so the form still
  // works end to end locally. Never reachable in production — DEMO_MODE is off
  // whenever NODE_ENV is "production".
  if (DEMO_MODE) {
    const base64 = Buffer.from(bytes).toString("base64");
    return Response.json({ url: `data:${sniffed};base64,${base64}`, contentType: sniffed });
  }

  return fail(
    "Image storage is not configured. Add BLOB_READ_WRITE_TOKEN to the environment.",
    501
  );
}
