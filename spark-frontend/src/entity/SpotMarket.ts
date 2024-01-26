import { runInAction } from "mobx";

import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { fetchMarketPrice } from "@src/services/SpotMarketService";
import BN from "@src/utils/BN";

import { Token } from "./Token";

export class SpotMarket {
  readonly baseToken: Token;
  readonly quoteToken: Token;
  price: BN = BN.ZERO; //todo брать начальное значение из локалстораджа

  constructor(baseToken: string, quoteToken: string) {
    this.baseToken = TOKENS_BY_ASSET_ID[baseToken];
    this.quoteToken = TOKENS_BY_ASSET_ID[quoteToken];
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  get priceUnits(): BN {
    return BN.formatUnits(BN.ZERO, 9);
  }

  get change24(): BN {
    return BN.ZERO;
  }

  fetchPrice = async () => {
    try {
      const price = await fetchMarketPrice(this.baseToken.assetId);
      runInAction(() => {
        this.price = price;
      });
    } catch (error) {
      console.error("Ошибка при получении цены:", error);
    }
  };
}
