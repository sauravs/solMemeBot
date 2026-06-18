// Notifier seam. A high-signal event is dispatched to one or more channels
// (in-app feed + Telegram). Adapters satisfy this one interface.

export type AlertType = "wallet_buy" | "safety_danger";

export interface AlertEvent {
  ownerId: string;
  type: AlertType;
  payload: {
    wallet: string;
    tokenMint: string;
    verdict: string | null;
    txSig: string;
  };
}

export interface Notifier {
  notify(event: AlertEvent): Promise<void>;
}
