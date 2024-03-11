export enum NETWORK_ERROR {
  // Regular
  UNKNOWN_NETWORK_TYPE = 1,
  INVALID_TOKEN = 2,
  NOT_CONNECTED = 3,
  INVALID_WALLET_PROVIDER = 4,

  // EVM related
  UNKNOWN_SIGNER = 1001,

  // Fuel related
  UNKNOWN_WALLET = 2001,
  UNKNOWN_ACCOUNT = 2002,
}

const NETWORK_ERROR_MESSAGE: Record<NETWORK_ERROR, string> = {
  [NETWORK_ERROR.UNKNOWN_NETWORK_TYPE]: "Unknown Blockchain Network type.",
  [NETWORK_ERROR.INVALID_TOKEN]: "Invalid token.",
  [NETWORK_ERROR.UNKNOWN_SIGNER]: "Signer does not exist.",
  [NETWORK_ERROR.INVALID_WALLET_PROVIDER]: "Wallet not connected.",
  [NETWORK_ERROR.NOT_CONNECTED]: "Not connected to a wallet.",
  [NETWORK_ERROR.UNKNOWN_WALLET]: "Wallet does not exist.",
  [NETWORK_ERROR.UNKNOWN_ACCOUNT]: "Account is not connected.",
};

export class NetworkError extends Error {
  code: NETWORK_ERROR;

  constructor(code: NETWORK_ERROR) {
    super(NETWORK_ERROR_MESSAGE[code]);
    this.code = code;

    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
