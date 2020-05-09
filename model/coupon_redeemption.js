const mongoose = require('mongoose');

const CouponRedeemptionSchema = new mongoose.Schema({
    value: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    points: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const CouponRedeemption = mongoose.model('CouponRedeemption', CouponRedeemptionSchema);

module.exports = CouponRedeemption;