import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { AlertEvent, Notifier } from "./types";

// Persists every alert to the in-app feed. Always available and fully testable.
export const inAppNotifier: Notifier = {
  notify: async (event: AlertEvent) => {
    await prisma.alert.create({
      data: {
        ownerId: event.ownerId,
        type: event.type,
        payload: event.payload as unknown as Prisma.InputJsonValue,
        channel: "in_app",
      },
    });
  },
};
