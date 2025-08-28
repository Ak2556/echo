// Example: WebSocket connection

import io from 'socket.io-client';

const WS_URL = 'ws://localhost:8000';

function connectWebSocket(token) {
  const socket = io(WS_URL, {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
  });

  socket.on('message', (data) => {
    console.log('Received message:', data);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket');
  });

  return socket;
}

function sendMessage(socket, message) {
  socket.emit('send_message', { content: message });
}

// Usage
const token = 'your_jwt_token_here';
const socket = connectWebSocket(token);

// Send a message
setTimeout(() => {
  sendMessage(socket, 'Hello, Echo!');
}, 1000);
