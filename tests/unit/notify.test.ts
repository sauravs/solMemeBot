import { describe, it, expect } from "vitest";
import { compositeNotifier } from "@/lib/notify/composite";
import { buildTelegramText } from "@/lib/notify/telegram";
import type { AlertEvent, Notifier } from "@/lib/notify/types";

const event: AlertEvent = {
  ownerId: "u1",
  type: "wallet_buy",
  payload: {
    wallet: "KOL whale #1",
    tokenMint: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A",
    verdict: "safe",
    txSig: "sig1",
  },
};

function recordingNotifier(): { notifier: Notifier; calls: AlertEvent[] } {
  const calls: AlertEvent[] = [];
  return { notifier: { notify: async (e) => void calls.push(e) }, calls };
}

describe("compositeNotifier", () => {
  it("dispatches the event to every child notifier", async () => {
    const a = recordingNotifier();
    const b = recordingNotifier();
    await compositeNotifier([a.notifier, b.notifier]).notify(event);
    expect(a.calls).toEqual([event]);
    expect(b.calls).toEqual([event]);
  });

  it("keeps dispatching even if one channel throws", async () => {
    const ok = recordingNotifier();
    const broken: Notifier = {
      notify: async () => {
        throw new Error("channel down");
      },
    };
    await expect(
      compositeNotifier([broken, ok.notifier]).notify(event),
    ).resolves.toBeUndefined();
    expect(ok.calls).toEqual([event]);
  });
});

describe("buildTelegramText", () => {
  it("formats a normal buy", () => {
    const text = buildTelegramText(event);
    expect(text).toContain("KOL whale #1");
    expect(text).toContain("bought");
    expect(text).not.toContain("DANGER");
  });

  it("flags a danger-token buy", () => {
    const text = buildTelegramText({ ...event, type: "safety_danger", payload: { ...event.payload, verdict: "danger" } });
    expect(text).toContain("DANGER");
    expect(text).toContain("KOL whale #1");
  });
});
