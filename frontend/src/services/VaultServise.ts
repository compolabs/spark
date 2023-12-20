import { VAULT_INDEXER } from "@src/constants";
import BN from "@src/utils/BN";
import makeIndexerRequest from "@src/utils/makeIndexerRequest";

export const getUserFreeCollateral = async (address: string): Promise<BN> => {
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_vault_indexer.collateralentity WHERE trader = '${address}' ) t;`;
	const res = await makeIndexerRequest(query, VAULT_INDEXER);
	return res?.data.data.length === 0 ? BN.ZERO : new BN(res?.data.data[0][0].collateral);
};
