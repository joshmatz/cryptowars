import axios from "axios";

const api = axios.create({
  baseURL: "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/lending",
});

export async function getAccountAssets(address, chainId) {
  const res = await api.get("/account-assets", {
    params: {
      address,
      chainId,
    },
  });

  return res.data.result;
}

export default api;
