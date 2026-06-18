import type { AlertEvent, Notifier } from "./types";

function short(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

/** Human-readable Telegram message for an alert. Pure. */
export function buildTelegramText(event: AlertEvent): string {
  const { wallet, tokenMint, verdict } = event.payload;
  const token = short(tokenMint);
  if (event.type === "safety_danger") {
    return `🚨 ${wallet} bought a DANGER token ${token} (safety: ${verdict ?? "unknown"})`;
  }
  return `🟢 ${wallet} bought ${token}${verdict ? ` (safety: ${verdict})` : ""}`;
}

/**
 * Telegram adapter. A no-op when the bot isn't configured (dev/CI), so the rest
 * of the pipeline runs unaffected; in production it pushes a message.
 */
export const telegramNotifier: Notifier = {
  notify: async (event: AlertEvent) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: buildTelegramText(event) }),
      });
    } catch {
      // Never let a Telegram outage break ingestion.
    }
  },
};
