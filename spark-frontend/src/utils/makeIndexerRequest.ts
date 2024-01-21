import axios from "axios";

const makeIndexerRequest = async (query: string, indexer: string) => {
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	return await axios.request({ method: "POST", url: indexer, headers, data: { query } });
};
export default makeIndexerRequest;
