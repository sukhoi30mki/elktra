const randomString = require('randomstring');
const bcrypt = require('bcrypt');

exports.generateRandomString = async (size) => {
    try {
        return randomString.generate(size);
    } catch (error) {
        throw Error('Unable to generate random string');
    }
}

exports.hashedPassword = async (password) => {
    try {
        const hash = await new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    reject('Error occured while generating salt');
                }

                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        reject('Unable to bcrypt the password')
                    }

                    resolve(hash);
                });
            });
        });

        return hash;
    } catch (error) {
        throw Error('Unable to bcrypt the password')
    }
}