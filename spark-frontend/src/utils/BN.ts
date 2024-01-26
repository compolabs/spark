import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber";
import BigNumber from "bignumber.js";
import { Undefinable } from "tsdef";

BigNumber.config({ EXPONENTIAL_AT: [-100, 100] });

type TValue = BN | EthersBigNumber | BigNumber.Value;

const bigNumberify = (n: any): string | number => {
  if (n && n.toString) {
    const primitive = n.toString();

    if (typeof primitive !== "object") {
      return primitive;
    }
  }

  return n;
};

class BN extends BigNumber {
  static ZERO = new BN(0);
  static MaxUint256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  dividedBy = this.div;
  exponentiatedBy = this.pow;
  modulo = this.mod;
  multipliedBy = this.times;
  squareRoot = this.sqrt;

  constructor(n: TValue, base?: number) {
    super(bigNumberify(n), base);
  }

  static clamp(number: TValue, min: TValue, max: TValue): BN {
    return BN.min(BN.max(number, min), max);
  }

  static max(...n: TValue[]): BN {
    return new BN(super.max(...n.map(bigNumberify)));
  }

  static min(...n: TValue[]): BN {
    return new BN(super.min(...n.map(bigNumberify)));
  }

  static toBN(p: Promise<EthersBigNumber | number | string>): Promise<BN> {
    return p.then((v) => new BN(v));
  }

  static parseUnits(value: TValue, decimals = 8): BN {
    return new BN(10).pow(decimals).times(bigNumberify(value));
  }

  static formatUnits(value: TValue, decimals = 8): BN {
    return new BN(value).div(new BN(10).pow(decimals));
  }

  static percentOf(value: TValue, percent: TValue): BN {
    return new BN(new BN(value).times(percent).div(100).toFixed(0));
  }

  static ratioOf(valueA: TValue, valueB: TValue): BN {
    return new BN(valueA).div(valueB).times(100);
  }

  static toEthersBN(value: TValue): EthersBigNumber {
    return EthersBigNumber.from(value.toString());
  }

  abs(): BN {
    return new BN(super.abs());
  }

  div(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.div(bigNumberify(n), base));
  }

  pow(n: TValue, m?: Undefinable<TValue>): BN {
    return new BN(super.pow(bigNumberify(n), bigNumberify(m)));
  }

  minus(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.minus(bigNumberify(n), base));
  }

  mod(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.mod(bigNumberify(n), base));
  }

  times(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.times(bigNumberify(n), base));
  }

  negated(): BN {
    return new BN(super.negated());
  }

  plus(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.plus(bigNumberify(n), base));
  }

  sqrt(): BN {
    return new BN(super.sqrt());
  }

  toDecimalPlaces(decimalPlaces: number, roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): BN {
    return new BN(super.dp(decimalPlaces, roundingMode));
  }

  toBigFormat(decimalPlaces: number): string {
    if (super.toNumber() > 999 && super.toNumber() < 1000000) {
      return (super.toNumber() / 1000).toFixed(1) + "K";
    } else if (super.toNumber() > 1000000) {
      return (super.toNumber() / 1000000).toFixed(1) + "M";
    } else if (super.toNumber() < 900) {
      return super.toFormat(decimalPlaces); // if value < 1000, nothing to do
    }
    return super.toFormat(decimalPlaces);
  }

  toSignificant(significantDigits: number, roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): BN {
    return this.gte(1)
      ? this.toDecimalPlaces(significantDigits)
      : new BN(super.precision(significantDigits, roundingMode));
  }

  clamp(min: TValue, max: TValue): BN {
    return BN.min(BN.max(this, min), max);
  }
}

export type TEtherBigNumber = EthersBigNumber;

export default BN;
