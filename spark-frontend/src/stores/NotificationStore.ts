import { toast } from "react-toastify";
import { makeAutoObservable } from "mobx";

import RootStore from "@stores/RootStore";

class NotificationStore {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  toast = toast;
}

export default NotificationStore;
