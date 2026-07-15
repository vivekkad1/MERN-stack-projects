"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./socket");
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 5000;
// Connect to database
(0, db_1.default)();
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io
(0, socket_1.initSocket)(server);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
