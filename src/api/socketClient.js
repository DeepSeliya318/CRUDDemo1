import {io} from 'socket.io-client';
import {getToken} from '../utils/asyncStorage';

let socket = null;

export async function getSocket({baseUrl} = {}) {
  if (socket && socket.connected) return socket;

  const token = await getToken();
  const url = baseUrl || 'http://192.168.56.1:3000';

  socket = io(url, {
    transports: ['websocket'],
    auth: {
      token,
    },
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
