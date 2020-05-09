const router = require('express').Router();
const common = require('../helpers/common');
const Coupon = require('../model/coupon');
const CouponRedeemption = require('../model/coupon_redeemption');
const moment = require('moment');
const firebase = require('firebase');

const db = firebase.database();
var userRef = db.ref('users');

router.get('/create', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('coupon/create');
    }
    else {
        res.redirect('/');
    }
});

router.post('/create', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const total_number = req.body.total_number;
        const points = req.body.points;
        const coupon_data = [];

        for (let i = 1; i <= total_number; i++) {
            coupon_data.push({
                id: i,
                value: await common.generateRandomString(5),
                points: points,
                isActive: true,
                timestamp: moment(Date.now()).startOf('day'),
                isRedeem: false,
                comments: "",
                user_who_changed_status: ""
            });
        }

        const newCoupon = new Coupon({
            batch_id: await common.generateRandomString(10),
            data: coupon_data
        });

        await newCoupon.save();

        req.flash('success_msg', 'Coupons generated successfully');
        res.redirect('/coupon/create')
    }
    else {
        res.redirect('/');
    }
});

router.get('/manage', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const couponList = [];
        const coupons = await Coupon.find({});

        coupons.forEach(coupon => {
            couponList.push({
                batch_id: coupon.batch_id,
                timestamp: moment(coupon.timestamp).format('LL')
            });
        });


        res.render('coupon/manage', { coupons: couponList })
    }
    else {
        res.redirect('/');
    }
});


router.get('/list', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const couponList = [];
        const coupons = await Coupon.findOne({ batch_id: req.query.batch_id });
        const couponData = coupons.data;

        couponData.forEach(async coupon => {
            // console.log(coupon);

            const couponRedeem = await CouponRedeemption.findOne({ value: coupon.value });

            if (couponRedeem !== null && coupon.value === couponRedeem.value) {
                couponList.push({
                    id: coupon.id,
                    value: coupon.value,
                    points: coupon.points,
                    isActive: coupon.isActive,
                    isRedeem: coupon.isRedeem,
                    mobile_number: couponRedeem.mobilenumber,
                    coupon_redeem_timestamp: moment(couponRedeem.timestamp).format('L h:mm:ss a')
                })
            }
            else {
                couponList.push({
                    id: coupon.id,
                    value: coupon.value,
                    points: coupon.points,
                    isActive: coupon.isActive,
                    isRedeem: coupon.isRedeem,
                    comments: coupon.comments,
                    user_who_changed_status: coupon.user_who_changed_status
                })
            }
        })

        console.log(couponList);


        res.render('coupon/list', { batch_id: coupons.batch_id, coupons: couponList })
    }
    else {
        res.redirect('/');
    }
});

router.post('/status', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const batch_id = req.body.batch_id;
        const value = req.body.value;
        const comments = req.body.comments;

        const coupons = await Coupon.findOne({ batch_id });

        const currentCoupon = coupons.data.filter(couponData => couponData.value == value);

        if (currentCoupon[0].isRedeem == false) {
            const isActive = (currentCoupon[0].isActive === true) ? false : true;

            await Coupon.updateOne({ 'data.value': value }, {
                $set: {
                    'data.$.isActive': isActive,
                    'data.$.comments': comments,
                    'data.$.user_who_changed_status': req.user.email
                }
            });

            req.flash('success_msg', 'Record updated');
            res.redirect(`/coupon/list?batch_id=${batch_id}`);
        }
        else {
            req.flash('error_msg', 'Unable to change the status');
            return res.redirect(`/coupon/list?batch_id=${batch_id}`);
        }
    }
    else {
        res.redirect('/');
    }
});

router.post('/redeem-points', async (req, res) => {
    const { value, mobile_number } = req.body;

    const customerDetails = await userRef
        .orderByChild('phone')
        .equalTo(mobile_number)
        .once('value')

    if (customerDetails) {
        const couponDetails = await Coupon.aggregate([
            { $match: { 'data.value': value } },
            {
                $project: {
                    data: {
                        $filter: {
                            input: '$data',
                            as: 'coupon',
                            cond: { $eq: ['$$coupon.value', value] }
                        }
                    },
                    _id: 0
                }
            }
        ]);

        const coupon = couponDetails[0].data[0];

        if (coupon.value == value && coupon.isActive == true && coupon.isRedeem == false) {
            let userSnapshot = await userRef.orderByChild("phone").equalTo(mobile_number).once("child_added");

            let walletBalance = userSnapshot.val().wallet;
            wallet = parseInt(walletBalance) + parseInt(coupon.points);
            await userSnapshot.ref.update({ wallet });

            let newCouponRedeemption = new CouponRedeemption({
                value: value,
                mobilenumber: mobile_number,
                points: coupon.points
            });

            await newCouponRedeemption.save();
            await Coupon.updateOne({ 'data.value': value }, {
                $set: {
                    'data.$.isActive': false,
                    'data.$.isRedeem': true
                }
            });

            res.json({
                status: 200,
                success: true,
                message: "Coupon redeemed successfully"
            });

        }
        else {
            res.json({
                status: 400,
                success: false,
                message: "Code is invalid"
            })
        }
    }
    else {
        res.json({
            status: 400,
            success: false,
            message: "Unable to find customer"
        })
    }
});

module.exports = router;