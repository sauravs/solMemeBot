import type { AlertEvent, Notifier } from "./types";

/**
 * Fan an alert out to several notifiers. One failing channel must not stop the
 * others, so each is awaited independently and errors are contained.
 */
export function compositeNotifier(notifiers: Notifier[]): Notifier {
  return {
    notify: async (event: AlertEvent) => {
      await Promise.all(
        notifiers.map(async (n) => {
          try {
            await n.notify(event);
          } catch {
            // contained — other channels still fire
          }
        }),
      );
    },
  };
}
