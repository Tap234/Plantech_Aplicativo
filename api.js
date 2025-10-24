import axios from 'axios';

const api = axios.create({
  baseURL: 'http://20.20.20.113:8080/api',
});

export default api;