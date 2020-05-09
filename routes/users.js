const router = require('express').Router();
const { User } = require('../model/users');
const ActivityLogs = require('../model/activity_logs');
const Coupon = require('../model/coupon');
const common = require('../helpers/common');
const Handlebars = require('handlebars');

// Middleware for express router
router.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

Handlebars.registerHelper('ifAdmin', (user, options) => {
    if (user && options.hash.role == user.role) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('ifSubAdmin', (user, options) => {
    if (user && options.hash.role == user.role) {
        return options.fn(this)
    }
    return options.inverse(this);
});

router.get('/dashboard', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('dashboard');
    }
    else {
        res.redirect('/');
    }
});

router.get('/create', (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.role === "admin") {
        res.render('user/create');
    }
    else {
        res.redirect('/');
    }
});

router.post('/create', async (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.role === "admin") {

        try {
            const { username, email, mobile } = req.body;

            if (!email) {
                req.flash('error_msg', 'Please enter email address');
                res.redirect('/users/create');
            }
            else if (mobile.length > 10) {
                req.flash('error_msg', 'Invalid mobile number');
                res.redirect('/users/create');
            }
            else {
                const isUserExist = await User.findOne({ email });

                if (isUserExist) {
                    req.flash('error_msg', 'User with this email address already exists');
                    res.redirect('/users/create')
                }
                else {
                    const password = await common.generateRandomString(16);

                    const newUser = new User({
                        username,
                        email,
                        mobile,
                        password,
                        role: "subAdmin"
                    });
                    await newUser.save();

                    req.flash('success_msg', `User created successfully. Email: ${email} and Password: ${password}`);
                    res.redirect('/users/create');
                }
            }
        } catch (error) {
            req.flash('error_msg', 'Oops, Something went wrong');
            res.redirect('/users/create');
        }
    }
    else {
        res.redirect('/')
    }
});

router.get('/manage', async (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.role === "admin") {
        try {
            const usersList = [];
            const users = await User.find({});

            users.forEach(user => {
                if (user.role !== 'admin') {
                    usersList.push({
                        username: (user.username != '') ? user.username : 'N/A',
                        email: user.email,
                        mobile: (user.mobile != '') ? user.mobile : 'N/A',

                    });
                }
            });

            res.render('user/manage', { users: usersList })
        } catch (error) {
            req.flash('error_msg', 'Oops, Something went wrong');
            res.redirect('/users/create');
        }
    }
    else {
        res.redirect('/');
    }
});

router.post('/delete', async (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.role === "admin") {
        try {
            const email = req.body.email;

            await User.findOneAndDelete({ email });

            req.flash('success_msg', `User ${email} is successfully deleted`);
            res.redirect('/users/manage');
        } catch (error) {
            req.flash('error_msg', 'Oops, Something went wrong');
            res.redirect('/users/manage');
        }
    }
    else {
        res.redirect('/');
    }
});

router.get('/activity-logs', async (req, res) => {
    if (req.user && req.isAuthenticated()) {
        try {
            const email = (req.query.email) ? req.query.email : req.user.email;

            const activityLogArr = [];
            const response = await ActivityLogs.find({ email });

            response.forEach(log => {
                activityLogArr.push({
                    ip: log.ip,
                    browser: log.browser,
                    timestamp: log.timestamp
                });
            });

            return res.render('user/activity-logs',
                {
                    activityLogArr: activityLogArr
                });
        } catch (error) {
            return res.render('user/activity-logs');
        }
    }
    else {
        res.redirect('/');
    }
})

router.get('/change-password', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('user/change-password');
    }
    else {
        res.redirect('/');
    }
});

router.post('/change-password', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        try {
            if (req.body.new_password == req.body.confirm_new_password) {
                const user = await User.findOne({ email: req.user.email });

                if (user) {
                    user.password = req.body.new_password;
                    await user.save();

                    req.flash('success_msg', 'Password changed sucessfully');
                    res.redirect('/users/change-password');
                }
            }
            else {
                req.flash('error_msg', 'Passwords does not match');
                res.redirect('/users/change-password');
            }
        } catch (error) {
            console.log(error);

            req.flash('error_msg', 'Whoops, something went wrong');
            res.redirect('/users/change-password');
        }
    }
    else {
        res.redirect('/');
    }
});

router.get('/coupon/manage', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const couponList = [];
        const coupons = await Coupon.find({ 'data.isActive': false });

        coupons.forEach(coupon => {
            couponList.push({
                batch_id: coupon.batch_id
            });
        })

        res.render('user/manageCoupon', { coupons: couponList })
    }
    else {
        res.redirect('/');
    }
});

router.get('/coupons/list', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const coupons = await Coupon.findOne({ batch_id: req.query.batch_id });

        const couponNotActiveDetails = coupons.data.filter(coupon => coupon.user_who_changed_status !== '');

        res.render('user/manageCouponList', { coupons: couponNotActiveDetails })
    }
    else {
        res.redirect('/');
    }
})

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        if (err) console.log('Error : Failed to destroy the session during logout.', err);
        req.user = null;
        return res.redirect('/');
    });
})

module.exports = router;