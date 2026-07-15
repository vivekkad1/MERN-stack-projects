"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Return = exports.ReturnStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ReturnStatus;
(function (ReturnStatus) {
    ReturnStatus["PENDING"] = "Pending";
    ReturnStatus["APPROVED"] = "Approved";
    ReturnStatus["REJECTED"] = "Rejected";
    ReturnStatus["REFUNDED"] = "Refunded";
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
const returnItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantSku: {
        type: String
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    reason: {
        type: String,
        required: true
    }
});
const returnSchema = new mongoose_1.Schema({
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seller: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [returnItemSchema],
    status: {
        type: String,
        enum: Object.values(ReturnStatus),
        default: ReturnStatus.PENDING,
    },
    refundAmount: {
        type: Number,
        required: true,
        default: 0
    },
    comments: {
        type: String,
    },
    adminComments: {
        type: String,
    }
}, {
    timestamps: true,
});
exports.Return = mongoose_1.default.model('Return', returnSchema);
