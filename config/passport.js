const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { User, comparePassword } = require('../model/users')
const ActivityLogs = require('../model/activity_logs')


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const user = await User.findOne({ "email": email.toLowerCase() });

    if (!user) {
        return done(null, false, {
            message: req.flash("error_msg", 'Invalid Email / Password')
        });
    }

    const isMatch = await comparePassword(email, password);

    if (isMatch) {
        req.logIn(user, async (err) => {
            if (err) {
                return done(null, false, {
                    message: req.flash("error_msg", 'Invalid Email / Password')
                });
            }

            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ip_arr = ip.split(':');
            ip = ip_arr[ip_arr.length - 1];
            let browser = req.headers['user-agent'];

            let newActivity = new ActivityLogs({
                email,
                ip,
                browser
            });

            await newActivity.save();

            return done(null, user);
        });
    }
    else {
        return done(null, false, {
            message: req.flash("error_msg", 'Invalid Email / Password')
        });
    }
}));



passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
