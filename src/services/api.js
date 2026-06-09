import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const shopService = {
  getAllShops: async () => {
    const response = await api.get('/shops');
    return response.data;
  },

  createShop: async (shopData) => {
    const response = await api.post('/shops', shopData);
    return response.data;
  },

  getUpcomingBirthdays: async () => {
    const response = await api.get('/shops/upcoming-birthdays');
    return response.data;
  },
};
