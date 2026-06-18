import type { Notifier } from "./types";
import { inAppNotifier } from "./in-app";
import { telegramNotifier } from "./telegram";
import { compositeNotifier } from "./composite";

export type { AlertEvent, AlertType, Notifier } from "./types";

/** In-app (always) + Telegram (no-op unless configured), fanned out together. */
export function getNotifier(): Notifier {
  return compositeNotifier([inAppNotifier, telegramNotifier]);
}
