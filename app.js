const bodyParser = require('body-parser');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const express = require('express');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
const firebase = require('firebase');

firebase.initializeApp({
    serviceAccount: './elektra-4ac46-d2d58a2cc264.json',
    databaseURL: 'https://elektra-4ac46.firebaseio.com'
});


require('dotenv').config({ path: __dirname + '/.env' });

const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/product');
const customerRoutes = require('./routes/customer');
const couponRoutes = require('./routes/coupons');

const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
});

//app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.APPLICATION_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }, // one week in milliseconds 1209600000
    store: new MongoStore({
        url: process.env.MONGODB_URI
    })
}));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport');
app.use(flash());

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
app.engine('hbs', expressHbs({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, '/views', 'layouts'),
    defaultLayout: 'layout.hbs'
}));

expressHbs.create({
    partialsDir: [__dirname, '/views/partials']
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/product/productImages/categoryImages', express.static(path.join(__dirname, 'productImages/categoryImages')));
app.use('/product/manage/productImages/categoryImages', express.static(path.join(__dirname, 'productImages/categoryImages')));
app.use('/product/manage/productImages/mainItemImages', express.static(path.join(__dirname, 'productImages/mainItemImages')));
app.use('/product/manage/productImages/subItemImages', express.static(path.join(__dirname, 'productImages/subItemImages')));

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.errors = req.flash('errors');
    next();
});

app.use('/', indexRoutes);
app.use('/users', userRoutes);
app.use('/product', productRoutes);
app.use('/customer', customerRoutes);
app.use('/coupon', couponRoutes);

app.get('/', function (req, res) {
    return res.redirect('/login');
});

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('404');
});


module.exports = app;
