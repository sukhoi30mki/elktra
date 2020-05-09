const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const firebase = require('firebase');
const db = firebase.database();

const categoryRef = db.ref('products/category');
const mainItemRef = db.ref('products/mainitem');
const subItemRef = db.ref('products/subitem')

// Set storage Engine
const categoryImagesStorage = multer.diskStorage({
    destination: './productImages/categoryImages',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const mainItemImagesStorage = multer.diskStorage({
    destination: './productImages/mainItemImages',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const subItemImagesStorage = multer.diskStorage({
    destination: './productImages/subItemImages',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const categoryUploads = multer({
    storage: categoryImagesStorage
}).array('categoryImages');

// Init Upload
const mainItemUploads = multer({
    storage: mainItemImagesStorage
}).array('mainItemImages');

// Init Upload
const subItemUploads = multer({
    storage: subItemImagesStorage
}).array('subItemImages');

router.get('/category/add', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('product/category/add');
    }
    else {
        res.redirect('/');
    }
});

router.post('/category/add', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        categoryUploads(req, res, (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            }

            const data = {
                name: req.body.category_name,
                image: (req.files[0]) ? req.files[0].path : '',
                description: req.body.category_description

            }

            categoryRef.push(data, (err) => {
                if (err) {
                    req.flash('error_msg', 'Unable to add a category');
                    res.redirect('/product/category/add');
                }

                req.flash('success_msg', 'Category successfully added');
                res.redirect('/product/category/add');
            });
        });
    }
    else {
        res.redirect('/');
    }
});

router.get('/category/update', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const categoryList = [];

        categoryRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    if (data.key == req.query.category_id) {
                        categoryList.push({
                            id: data.key,
                            name: data.val().name,
                            description: data.val().description
                        });
                    }
                });

                res.render('product/category/update', { category: categoryList });
            })
            .catch(error => {
                res.redirect('product/manage');
            });
    }
    else {
        res.redirect('/');
    }
});

router.post('/category/update', (req, res) => {
    if (req.isAuthenticated() && req.user) {

        const data = {
            name: req.body.category_name,
            image: req.body.categoryImages,
            description: req.body.category_description
        };
        categoryRef.child(req.body.uid).update(data, (err) => {
            if (err) {
                throw new err;
            }
            else {
                req.flash('success_msg', "Details updated");
                res.redirect('/product/manage');
            }
        });
    }
    else {
        res.redirect('/');
    }
});

router.post('/category/delete', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        categoryRef.child(req.body.category_id).remove()
            .then(() => {
                req.flash('success_msg', "Category deleted successfully");
                res.redirect('/product/manage');

            });
    }
    else {
        res.redirect('/');
    }
});

router.get('/category-list', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const categoryList = [];

        categoryRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    // if (data.val().name == req.query.term.term) {
                    //     categoryList.push({
                    //         id: data.key,
                    //         name: data.val().name
                    //     });
                    // }
                    categoryList.push({
                        id: data.key,
                        name: data.val().name
                    });
                });

                return res.json({
                    items: categoryList
                });

            })
            .catch(error => {
                return res.json({
                    items: false
                });
            });
    }
    else {
        res.redirect('/')
    }
});

router.get('/mainitem/add', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('product/mainitem/add');
    }
    else {
        res.redirect('/');
    }
});

router.post('/mainitem/add', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        mainItemUploads(req, res, (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            }

            const data = {
                category_id: req.body.category_id,
                name: req.body.mainItem_name,
                image: (req.files[0]) ? req.files[0].path : '',
                description: req.body.mainItem_description,
            }

            mainItemRef.push(data, (err) => {
                if (err) {
                    req.flash('error_msg', 'Unable to add a mainitem');
                    res.redirect('/product/mainitem/add');
                }

                req.flash('success_msg', 'Mainitem successfully added');
                res.redirect('/product/mainitem/add');
            });
        });
    }
    else {
        res.redirect('/');
    }
});

router.get('/mainitem-list', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const mainItemList = [];

        mainItemRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    // if (data.val().name == req.query.term.term) {
                    //     mainItemList.push({
                    //         id: data.key,
                    //         name: data.val().name
                    //     });
                    // }
                    mainItemList.push({
                        id: data.key,
                        name: data.val().name
                    });
                });

                return res.json({
                    items: mainItemList
                });

            })
            .catch(error => {
                return res.json({
                    items: false
                });
            });
    }
    else {
        res.redirect('/')
    }
});

router.get('/mainitem/update', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const mainitemList = [];

        mainItemRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    if (data.key == req.query.mainitem_id) {
                        mainitemList.push({
                            id: data.key,
                            category_id: data.val().category_id,
                            name: data.val().name,
                            description: data.val().description
                        });
                    }
                });

                res.render('product/mainitem/update', { mainitem: mainitemList });
            })
            .catch(error => {
                res.redirect('product/manage');
            });
    }
    else {
        res.redirect('/');
    }
});

router.post('/mainitem/update', (req, res) => {
    if (req.isAuthenticated() && req.user) {

        const data = {
            category_id: req.body.category_id,
            name: req.body.mainItem_name,
            image: req.body.mainItemImages,
            description: req.body.mainItem_description
        };

        mainItemRef.child(req.body.mainitem_id).update(data, (err) => {
            if (err) {
                throw new err;
            }
            else {
                req.flash('success_msg', "Details updated");
                res.redirect('/product/manage');
            }
        });
    }
    else {
        res.redirect('/');
    }
});

router.post('/mainitem/delete', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        mainItemRef.child(req.body.mainitem_id).remove()
            .then(() => {
                req.flash('success_msg', "Mainitem deleted successfully");
                res.redirect('/product/manage');

            });
    }
    else {
        res.redirect('/');
    }
});

router.get('/subitem/add', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('product/subitem/add');
    }
    else {
        res.redirect('/');
    }
});

router.post('/subitem/add', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        subItemUploads(req, res, (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            }

            const data = {
                mainitem_id: req.body.mainitem_id,
                name: req.body.subItem_name,
                image: (req.files[0]) ? req.files[0].path : '',
                price: req.body.subItem_price,
                description: req.body.subItem_description,
            }

            subItemRef.push(data, (err) => {
                if (err) {
                    req.flash('error_msg', 'Unable to add a subitem');
                    res.redirect('/product/subitem/add');
                }

                req.flash('success_msg', 'SubItem successfully added');
                res.redirect('/product/subitem/add');
            });
        });
    }
    else {
        res.redirect('/');
    }
});

router.get('/subitem-list', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const subItemList = [];

        subItemRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    if (data.val().name == req.query.term.term) {
                        subItemList.push({
                            id: data.key,
                            name: data.val().name
                        });
                    }
                });

                return res.json({
                    items: subItemList
                });

            })
            .catch(error => {
                return res.json({
                    items: false
                });
            });
    }
    else {
        res.redirect('/')
    }
});

router.get('/subitem/update', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const subitemList = [];

        subItemRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    if (data.key == req.query.subitem_id) {
                        subitemList.push({
                            id: data.key,
                            mainitem_id: data.val().mainitem_id,
                            name: data.val().name,
                            price: data.val().price,
                            description: data.val().description
                        });
                    }
                });

                res.render('product/subitem/update', { subitem: subitemList });
            })
            .catch(error => {
                res.redirect('product/manage');
            });
    }
    else {
        res.redirect('/');
    }
});

router.post('/subitem/update', (req, res) => {
    if (req.isAuthenticated() && req.user) {

        const data = {
            mainitem_id: req.body.mainitem_id,
            name: req.body.subItem_name,
            image: req.body.subItemImages,
            price: req.body.subItem_price,
            description: req.body.subItem_description
        };

        subItemRef.child(req.body.subitem_id).update(data, (err) => {
            if (err) {
                throw new err;
            }
            else {
                req.flash('success_msg', "Subitems details updated");
                res.redirect('/product/manage');
            }
        });
    }
    else {
        res.redirect('/');
    }
});

router.post('/subitem/delete', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        subItemRef.child(req.body.subitem_id).remove()
            .then(() => {
                req.flash('success_msg', "Subitem deleted successfully");
                res.redirect('/product/manage');
            });
    }
    else {
        res.redirect('/');
    }
});

router.get('/manage', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const categoryList = [];

        categoryRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    categoryList.push({
                        uid: data.key,
                        data: data.val()
                    });
                });
                res.render('product/manage', { product: categoryList });
            })
            .catch(error => {

            });
    }
    else {
        res.redirect('/');
    }
});

router.post('/manage/mainitem', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const mainitemList = [];

        mainItemRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    if (data.val().category_id == req.body.category_id) {
                        mainitemList.push({
                            uid: data.key,
                            data: data.val()
                        });
                    }
                });

                res.render('product/mainitem/manage', { mainitem: mainitemList });
            })
            .catch(error => {

            });
    }
    else {
        res.redirect('/');
    }
});

router.post('/manage/subitem', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const subItemList = [];

        subItemRef.once("value")
            .then(snapshot => {
                snapshot.forEach(data => {
                    if (data.val().mainitem_id == req.body.mainitem_id) {
                        subItemList.push({
                            uid: data.key,
                            data: data.val()
                        });
                    }
                });

                res.render('product/subitem/manage', { subitem: subItemList });
            })
            .catch(error => {

            });
    }
    else {
        res.redirect('/');
    }
});

module.exports = router;