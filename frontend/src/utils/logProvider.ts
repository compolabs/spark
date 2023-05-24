import { Provider, ProviderCallParams, TransactionRequestLike } from "fuels";

class LogProvider extends Provider {
  async call(
    transactionRequestLike: TransactionRequestLike,
    { utxoValidation }: ProviderCallParams = {}
  ) {
    console.log(JSON.stringify(transactionRequestLike, null, 2));
    return super.call(transactionRequestLike, { utxoValidation });
  }
}

export default LogProvider;
