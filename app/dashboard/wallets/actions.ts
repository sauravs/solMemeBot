"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isValidSolanaAddress } from "@/lib/solana/address";
import {
  addTrackedWallet,
  removeTrackedWallet,
} from "@/lib/repos/tracked-wallets";

const PAGE = "/dashboard/wallets";

export async function addWallet(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const address = String(formData.get("address") ?? "").trim();
  const rawLabel = String(formData.get("label") ?? "").trim();
  const label = rawLabel.length > 0 ? rawLabel : null;

  if (!isValidSolanaAddress(address)) {
    redirect(`${PAGE}?error=invalid`);
  }

  try {
    await addTrackedWallet(user.id, address, label);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(`${PAGE}?error=duplicate`);
    }
    throw e;
  }

  revalidatePath(PAGE);
  redirect(PAGE);
}

export async function removeWallet(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (id) await removeTrackedWallet(user.id, id);

  revalidatePath(PAGE);
  redirect(PAGE);
}
