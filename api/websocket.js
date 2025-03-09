const socketIo = require('socket.io');

let io;

function initializeWebSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

function emitUpdate(event, data) {
  const socket = getIO();
  socket.emit(event, data);
}

module.exports = {
  initializeWebSocket,
  getIO,
  emitUpdate
};