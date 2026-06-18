"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { realizedPnl } from "@/lib/journal/pnl";
import { addJournalEntry, removeJournalEntry } from "@/lib/repos/journal";

const PAGE = "/dashboard/journal";

function parsePositive(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseNonNegative(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function addTrade(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const token = String(formData.get("token") ?? "").trim();
  const quantity = parsePositive(formData.get("quantity"));
  const entry = parsePositive(formData.get("entry"));
  const fees = parseNonNegative(formData.get("fees"));

  const exitRaw = String(formData.get("exit") ?? "").trim();
  const exit = exitRaw === "" ? null : parsePositive(formData.get("exit"));

  // token, quantity, entry are required; exit is optional but must be valid if given.
  if (!token || quantity === null || entry === null || (exitRaw !== "" && exit === null)) {
    redirect(`${PAGE}?error=invalid`);
  }

  const closed = exit !== null;
  await addJournalEntry(user.id, {
    token,
    side: "buy",
    quantity: quantity!,
    entryPriceUsd: entry!,
    exitPriceUsd: exit,
    feesUsd: fees,
    realizedPnlUsd: closed ? realizedPnl({ quantity: quantity!, entry: entry!, exit: exit!, fees }) : null,
    closedAt: closed ? new Date() : null,
  });

  revalidatePath(PAGE);
  redirect(PAGE);
}

export async function removeTrade(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (id) await removeJournalEntry(user.id, id);

  revalidatePath(PAGE);
  redirect(PAGE);
}
