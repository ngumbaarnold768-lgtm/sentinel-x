import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000';
export const api = axios.create({ baseURL: API_BASE });
export const connectWebSocket = (onMessage) => {
  const ws = new WebSocket('ws://127.0.0.1:8000/ws/metrics');
  ws.onmessage = (event) => onMessage(JSON.parse(event.data));
  return ws;
};