const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Token = require('../models').Token;

const generateSalt = function (lengthOfString) {
    return crypto.randomBytes(Math.ceil(lengthOfString / 2))
        .toString('hex')
        .slice(0, lengthOfString);
};

const hashPassword = function (password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');

    return {
        salt: salt,
        passwordHash: value
    };
};

function saltHashPassword(password, user) {
    const salt = generateSalt(16);
    const passwordData = hashPassword(password, salt);

    return user.update({
        password: passwordData.passwordHash,
        salt: passwordData.salt
    });
}

function generatePassword() {
    return crypto.randomBytes(Math.ceil(4))
        .toString('hex')
        .slice(0, 8);
}

function createToken(token, userId) {
    return Token.create({
        token: token,
        userId: userId
    });
}

function compareCode(userCode, databaseCode, salt) {
    if (salt) {
        const passwordData = hashPassword(userCode, salt);
        helpers.logger.log('compareCode normal ', helpers.logger.LOG_TYPE_INFO);
        console.log(databaseCode);
        const hash = bcrypt.hashSync(databaseCode);

        return bcrypt.compareSync(passwordData.passwordHash, hash);
    } else {
        helpers.logger.log('compareCode strange ', helpers.logger.LOG_TYPE_INFO);
        console.log(databaseCode);
        const hash = bcrypt.hashSync(databaseCode);

        return bcrypt.compareSync(userCode, hash);
    }
}

function compareExpirationDate(a, b) {
    return b.expirationDate - a.expirationDate;
}

function generateToken() {
    const now = new Date();
    let token = now.getTime() + '';
    token = crypto.createHash('md5').update(token).digest('hex');
    return token;
}

function getUserString() {
    return ''
}

module.exports = {
    createToken,
    compareCode,
    generateToken,
    getUserString,
    saltHashPassword,
    compareExpirationDate,
    generatePassword
};