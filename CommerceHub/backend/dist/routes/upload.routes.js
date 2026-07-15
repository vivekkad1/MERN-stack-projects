"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Allow authenticated sellers and admins to upload images
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), upload_middleware_1.upload.single('image'), upload_controller_1.uploadImage);
exports.default = router;
