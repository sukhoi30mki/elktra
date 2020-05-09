const router = require('express').Router();
const CouponRedeemption = require('../model/coupon_redeemption');
const firebase = require('firebase');

const db = firebase.database();

var userRef = db.ref('users');

// userRef.push({
//     email: "sahil@gmail.com",
//     name: "sahil",
//     phone: "9700905392"
// });

router.get('/manage', (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.role === "admin") {
        const customersList = [];

        userRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    customersList.push({
                        uid: data.key,
                        username: data.val().name,
                        email: data.val().email,
                        mobile: data.val().phone,
                        wallet: data.val().wallet
                    });
                });

                res.render('customer/manage', { users: customersList })
            })
            .catch(error => {
                req.flash('error_msg', 'Oops, Something went wrong');
                res.redirect('/users/dashboard');
            })
    }
    else {
        res.redirect('/');
    }
});

router.post('/delete', (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.role === "admin") {
        const uid = req.body.uid;

        userRef.child(uid).remove()
            .then(() => {
                req.flash('success_msg', `Customer  ${uid} is successfully deleted`);
                res.redirect('/customer/manage');
            })
            .catch(error => {
                req.flash('error_msg', 'Oops, Something went wrong');
                res.redirect('/users/dashboard');
            });
    }
    else {
        res.redirect('/');
    }
});


router.post('/transaction', async (req, res) => {
    const customerTransactions = [];
    const mobileNumber = req.body.mobile_number;

    const customerDetails = await userRef
        .orderByChild('phone')
        .equalTo(mobileNumber)
        .once('value')

    if (customerDetails) {
        const couponsDetails = await CouponRedeemption.find({ mobilenumber: mobileNumber });

        couponsDetails.forEach(tx => {
            customerTransactions.push({
                points: tx.points,
                timestamp: tx.timestamp
            });
        });

        res.json({
            status: 200,
            success: true,
            transactions: customerTransactions
        });
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