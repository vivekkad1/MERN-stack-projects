"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.route('/')
    .post(ticket_controller_1.createTicket)
    .get((0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), ticket_controller_1.getTickets);
router.get('/my-tickets', ticket_controller_1.getMyTickets);
router.route('/:id')
    .get(ticket_controller_1.getTicketById);
router.post('/:id/responses', ticket_controller_1.addTicketResponse);
router.put('/:id/status', (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), ticket_controller_1.updateTicketStatus);
exports.default = router;
