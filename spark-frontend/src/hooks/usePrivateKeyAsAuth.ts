import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useStores } from "@src/stores";

const PK_KEY = "pk";

export const usePrivateKeyAsAuth = () => {
  const { accountStore } = useStores();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const privateKey = searchParams.get(PK_KEY);

    if (!privateKey?.length) return;

    (async () => accountStore.connectWalletByPrivateKey(privateKey))();
  }, [searchParams]);
};
