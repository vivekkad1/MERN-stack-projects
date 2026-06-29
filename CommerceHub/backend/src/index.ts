import http from 'http';
import app from './app';
import { initSocket } from './socket';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
