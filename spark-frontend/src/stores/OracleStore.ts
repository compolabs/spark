import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { toast } from "react-toastify";

class OracleStore {
    public rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }

    toast = toast;
}

export default OracleStore;
