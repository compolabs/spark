import { ACCOUNT_BALANCE_INDEXER, VAULT_INDEXER } from "@src/constants";
import axios from "axios";
import BN from "@src/utils/BN";

// interface ICollateralResponse {
// 	collateral: number;
// 	id: string;
// 	trader: string;
// }

export const getUserFreeCollateral = async (address: string): Promise<BN> => {
	console.log("address", address);
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_vault_indexer.collateralentity WHERE trader = '${address}' ) t;`;
	const url = VAULT_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });
	return res?.data.data[0][0] == null ? BN.ZERO : new BN(res?.data.data[0][0].collateral);
};
