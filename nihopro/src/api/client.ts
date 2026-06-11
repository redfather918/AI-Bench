/** API 客户端 - 连接到本地 FastAPI 后端 */
import axios from 'axios';

const BASE_URL = 'http://localhost:8001';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：打印日志
client.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// 响应拦截器：打印日志
client.interceptors.response.use(
  (res) => {
    console.log(`[API] ✅ ${res.config.url} → ${res.status}`);
    return res;
  },
  (err) => {
    const url = err.config?.url || 'unknown';
    const status = err.response?.status || 'NETWORK_ERROR';
    console.warn(`[API] ❌ ${url} → ${status}`);
    return Promise.reject(err);
  },
);

export default client;
