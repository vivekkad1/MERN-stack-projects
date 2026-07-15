"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = void 0;
const Product_1 = require("../models/Product");
// @desc    Handle chat with Gemini Assistant
// @route   POST /api/chat
// @access  Public (or optional auth)
const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!process.env.GEMINI_API_KEY) {
            res.status(200).json({
                success: true,
                reply: "Hello! I am the CommerceHub AI Assistant. However, my AI brain is currently offline because the API key is missing. Please ask the administrator to configure it."
            });
            return;
        }
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        // 1. Fetch catalog summary for context
        const products = await Product_1.Product.find({ isActive: true }).select('title basePrice category stock brand').populate('category', 'name');
        // Convert to a minimal string to save tokens
        const productCatalog = products.map(p => `- ${p.title} (Price: ₹${p.basePrice}, Category: ${p.category?.name || 'N/A'}, Stock: ${p.stock > 0 ? 'In Stock' : 'Out of Stock'})`).join('\n');
        const systemInstruction = `You are the official CommerceHub AI Shopping Assistant. 
You are helpful, friendly, and concise. Your job is to help customers find products, answer questions about our store, and guide purchasing decisions. 
Use markdown formatting where appropriate (e.g. bolding product names).
If a user asks for recommendations or searches for items, only recommend items from the catalog provided below. Do not invent products.
If they ask for something we don't have, politely inform them and suggest the closest alternative from our catalog.

CURRENT PRODUCT CATALOG:
${productCatalog}
`;
        // 2. Format history for Gemini SDK
        // @google/genai format uses { role: 'user' | 'model', parts: [{ text: string }] }
        const formattedHistory = (history || []).map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        // 3. Send request to Gemini 2.5 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                ...formattedHistory,
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });
        const reply = response.text;
        res.status(200).json({
            success: true,
            reply
        });
    }
    catch (error) {
        console.error("Gemini Chat Error:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI response',
            reply: "I'm sorry, I encountered an error while processing your request. Please try again later."
        });
    }
};
exports.handleChat = handleChat;
