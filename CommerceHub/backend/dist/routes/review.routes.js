"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Product specific review routes (create, get) are mounted in product.routes.ts
// Vote review
router.post('/:id/vote', auth_middleware_1.protect, review_controller_1.voteHelpful);
// Delete review (Admin/Super Admin only here, or we let the controller handle ownership)
router.delete('/:id', auth_middleware_1.protect, review_controller_1.deleteReview);
exports.default = router;
