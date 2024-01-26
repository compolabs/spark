interface TokenParams {
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  assetId: string;
}

export class Token {
  public readonly name: TokenParams["name"];
  public readonly symbol: TokenParams["symbol"];
  public readonly decimals: TokenParams["decimals"];
  public readonly logo: TokenParams["logo"];
  public readonly assetId: TokenParams["assetId"];

  constructor(params: TokenParams) {
    this.name = params.name;
    this.symbol = params.symbol;
    this.decimals = params.decimals;
    this.logo = params.logo;
    this.assetId = params.assetId;
  }
}
