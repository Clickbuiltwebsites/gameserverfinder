"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/auth";
import { createListing, deleteListing, DEMO_MODE } from "@/lib/repo";
import { getCurrentUser, DEMO_COOKIE } from "@/lib/session";
import { fieldErrors, formDataToListing, listingSchema } from "@/lib/validation";
import type { ListingFormErrors } from "@/lib/validation";

export type ListingFormState = {
  errors: ListingFormErrors;
  values?: Record<string, string>;
};

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    redirect("/signin?error=email");
  }
  await signIn("nodemailer", { email, redirectTo: "/dashboard" });
}

export async function signOutAction() {
  const store = await cookies();
  store.delete(DEMO_COOKIE);
  if (DEMO_MODE) redirect("/");
  await signOut({ redirectTo: "/" });
}

/** Dev-only. The action refuses to run unless DEMO_MODE is on. */
export async function enterDemoMode() {
  if (!DEMO_MODE) redirect("/signin");
  const store = await cookies();
  store.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/dashboard");
}

export async function createListingAction(
  _prev: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  // Server Functions are reachable by direct POST — authorise here, not in the UI.
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { form: "Your session expired. Sign in again and resubmit." } };
  }

  const raw = formDataToListing(formData);
  const parsed = listingSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: fieldErrors(parsed.error),
      values: Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [key, value == null ? "" : String(value)])
      ),
    };
  }

  const listing = await createListing(parsed.data, { id: user.id, name: user.name });

  revalidatePath("/");
  revalidatePath("/servers");
  revalidatePath("/dashboard");
  redirect(`/servers/${listing.slug}`);
}

export async function deleteListingAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  // deleteListing scopes the delete to the owner, so a forged id deletes nothing.
  await deleteListing(id, user.id);

  revalidatePath("/");
  revalidatePath("/servers");
  revalidatePath("/dashboard");
}
