"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const address_routes_1 = __importDefault(require("./routes/address.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const history_routes_1 = __importDefault(require("./routes/history.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const seller_routes_1 = __importDefault(require("./routes/seller.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const return_routes_1 = __importDefault(require("./routes/return.routes"));
const delivery_routes_1 = __importDefault(require("./routes/delivery.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const admin_features_routes_1 = __importDefault(require("./routes/admin.features.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Stripe webhook needs raw body, not JSON
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/addresses', address_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/brands', brand_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/wishlist', wishlist_routes_1.default);
app.use('/api/history', history_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/seller', seller_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/coupons', coupon_routes_1.default);
app.use('/api/returns', return_routes_1.default);
app.use('/api/delivery', delivery_routes_1.default);
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/admin/features', admin_features_routes_1.default);
// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'CommerceHub API is running' });
});
// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});
exports.default = app;
// Trigger restart
// Restarting again to apply order mock fix
// Trigger restart for logging
