const jwt = require('jsonwebtoken');
require('dotenv').config();

const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
};

const generateAccessToken = userId => jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
const generateRefreshToken = userId => jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

const sendTokens = (res, userId) => {

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    res.cookie('accessToken', accessToken, options);
    res.cookie('refreshToken', refreshToken, options);
};

const verifyAccessToken = (req, res, next) => {

    const token = req.cookies.accessToken;

    if(!token)
        return res.status(401).json({ error: 'Access token not found' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

        if(err)
            return res.status(403).json({ error: 'Invalid access token' });

        req.user = user;
        next();
    });
};

module.exports = { sendTokens, verifyAccessToken };