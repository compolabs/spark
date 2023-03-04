import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { Theme, toast } from "react-toastify";
import { ToastOptions } from "react-toastify/dist/types";
import getAlert from "@src/utils/alertUtil";

export type TNotifyOptions = ToastOptions & {
  link?: string;
  linkTitle?: string;
  title?: string;
};

class NotificationStore {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  toast(content: string, options: TNotifyOptions = {}) {
    let theme: Theme = "dark";

    toast(getAlert(content, options) ?? content, {
      autoClose: 1500,
      ...options,
      theme,
    });
  }
}

export default NotificationStore;
