const router = require('express').Router();
const passport = require('passport');

router.get('/login', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        return res.redirect('/users/dashboard');
    }
    return res.render('login');
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/forgot-password', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('users/dashboard');
    }
    else {
        res.render('forgotPassword');
    }
})

module.exports = router;