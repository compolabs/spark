import { NotificationStore } from "@src/stores";

export const handleEvmErrors = (notificationStore: NotificationStore, error: any, defaultMessage?: string) => {
  if (error.message.includes("user rejected action")) return;

  if (error.message.includes("insufficient funds for intrinsic transaction cost")) {
    notificationStore.toast("Not enough funds to pay gas", { type: "error" });
    return;
  }
  notificationStore.toast(defaultMessage ?? error.toString(), { type: "error" });
};
