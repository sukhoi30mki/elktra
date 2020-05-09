const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    batch_id: { type: String, required: true },
    data: { type: Array, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;