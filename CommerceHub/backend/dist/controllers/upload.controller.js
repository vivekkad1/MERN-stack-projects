"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file provided' });
            return;
        }
        if (!process.env.CLOUDINARY_API_KEY) {
            console.warn('Cloudinary API key missing. Mocking upload.');
            res.status(200).json({
                success: true,
                url: `https://via.placeholder.com/600?text=Mock+Upload+${Date.now()}`
            });
            return;
        }
        // Convert buffer to base64 for Cloudinary uploader
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary_1.default.uploader.upload(dataURI, {
            folder: 'commercehub',
            resource_type: 'auto',
        });
        res.status(200).json({
            success: true,
            url: result.secure_url,
        });
    }
    catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
};
exports.uploadImage = uploadImage;
