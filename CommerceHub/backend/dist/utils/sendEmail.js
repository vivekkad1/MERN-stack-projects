"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    // Use a real SMTP service or Ethereal for testing
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
            user: process.env.SMTP_EMAIL || 'dino.lindgren69@ethereal.email',
            pass: process.env.SMTP_PASSWORD || 'xK1yW4sQ1y1yW4sQ',
        },
    });
    const message = {
        from: `${process.env.FROM_NAME || 'CommerceHub'} <${process.env.FROM_EMAIL || 'noreply@commercehub.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
};
exports.sendEmail = sendEmail;
