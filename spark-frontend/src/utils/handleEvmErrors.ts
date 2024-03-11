import { NotificationStore } from "@src/stores";

export const handleEvmErrors = (notificationStore: NotificationStore, error: any, defaultMessage?: string) => {
  const message = error?.message.toLowerCase();

  if (message.includes("user rejected action") || message.includes("user rejected the transaction")) return;

  if (message.includes("insufficient funds for intrinsic transaction cost")) {
    notificationStore.toast("Not enough funds to pay gas", { type: "error" });
    return;
  }
  notificationStore.toast(defaultMessage ?? error.toString(), { type: "error" });
};
