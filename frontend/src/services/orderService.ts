import axios from "axios";

export interface IOrder {
  id: string;
  owner: string;
  asset0: string;
  amount0: string;
  asset1: string;
  amount1: string;
}

const orderService = {
  getOrders: async (): Promise<[]> => {
    const url = `${process.env.REACT_APP_API_BASE}/api/v1/orders`;
    const { data } = await axios.get(url);
    return data;
  },
  createOrder: async (order: IOrder): Promise<[]> => {
    const url = `${process.env.REACT_APP_API_BASE}/api/v1/order`;
    const { data } = await axios.post(url, order);
    return data;
  },
};
export default orderService;
