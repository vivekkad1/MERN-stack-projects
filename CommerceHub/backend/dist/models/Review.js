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
exports.Review = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    images: {
        type: [String],
        default: []
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: true // We can set this to false if Admin moderation is needed
    }
}, {
    timestamps: true
});
// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
// Static method to get average rating and save it to Product
reviewSchema.statics.getAverageRating = async function (productId) {
    const obj = await this.aggregate([
        {
            $match: { product: productId, isApproved: true }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 }
            }
        }
    ]);
    try {
        if (obj.length > 0) {
            await mongoose_1.default.model('Product').findByIdAndUpdate(productId, {
                rating: Math.round(obj[0].averageRating * 10) / 10,
                numReviews: obj[0].numOfReviews
            });
        }
        else {
            await mongoose_1.default.model('Product').findByIdAndUpdate(productId, {
                rating: 0,
                numReviews: 0
            });
        }
    }
    catch (err) {
        console.error(err);
    }
};
// Call getAverageRating after saving a review
reviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.product);
});
// Call getAverageRating after removing a review
// Mongoose 6+ requires document-based middleware for remove
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
    await this.constructor.getAverageRating(this.product);
});
exports.Review = mongoose_1.default.model('Review', reviewSchema);
