import { IToken } from "@src/constants";
import BN from "@src/utils/BN";

export interface IAssetBalance extends Omit<IToken, "logo"> {
  balance?: BN;
  usdEquivalent?: BN;
  logo?: string;
}

class Balance implements IAssetBalance {
  public readonly assetId: string;
  public readonly name: string;
  public readonly symbol: string;
  public readonly decimals: number;
  public readonly logo?: string;
  public readonly balance?: BN;
  public readonly usdEquivalent?: BN;

  constructor(props: IAssetBalance) {
    this.name = props.name;
    this.assetId = props.assetId;
    this.symbol = props.symbol;
    this.decimals = props.decimals;
    this.logo = props.logo;
    this.balance = props.balance;
    this.usdEquivalent = props.usdEquivalent;
  }

  get formatBalance() {
    if (this.balance == null) return "—";
    const value = BN.formatUnits(this.balance ?? 0, this.decimals);
    if (value.eq(0)) return value.toFormat(2);
    return value.gt(0.01) ? value.toFormat(2) : value.toFormat(6);
  }

  get formatUsdnEquivalent() {
    if (this.usdEquivalent == null) {
      return "—";
    }
    if (this.usdEquivalent.eq(0)) return `~ 0.00 $`;
    const v = this.usdEquivalent.gt(0.01) ? this.usdEquivalent.toFormat(2) : this.usdEquivalent.toFormat(6);
    return `~ ${v} $`;
  }
}

export default Balance;
