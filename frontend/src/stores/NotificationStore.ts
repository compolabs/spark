import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { THEME_TYPE } from "@src/themes/ThemeProvider";
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
    let theme: Theme =
      this.rootStore.settingsStore.selectedTheme === THEME_TYPE.DARK_THEME
        ? "dark"
        : "light";

    toast(getAlert(content, options) ?? content, {
      autoClose: 1500,
      ...options,
      theme,
    });
  }
}

export default NotificationStore;
