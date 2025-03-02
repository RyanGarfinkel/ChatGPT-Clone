const User = require('../Models/User');
const { sendTokens } = require('../Middleware/Token');
const jwt = require('jsonwebtoken');

const getUserObj = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
});

const signup = async (req, res) => {

    const { firstName, lastName, email, password } = req.body;

    if(!firstName)
        return res.status(400).json({ error: 'First name is required.' });

    if(!lastName)
        return res.status(400).json({ error: 'Last name is required.' });

    if(!email)
        return res.status(400).json({ error: 'Email is required.' });

    if(!password)
        return res.status(400).json({ error: 'Password is required.' });

    // Checks if email is already in use
    const emailExists = await User.findOne({ email: email })

    if(emailExists)
        return res.status(400).json({ error: 'Email already in use.' });

    const user = await User.create({ firstName: firstName, lastName: lastName, email: email, password: password })

    sendTokens(res, user._id.toString());
    res.status(201).json(getUserObj(user));
}

const login = async (req, res) => {
    
    const { email, password } = req.body;

    if(!email)
        return res.status(400).json({ error: 'Email is required.' });

    if(!password)
        return res.status(400).json({ error: 'Password is required.' });

    const user = await User.findOne({ email: email })
        
    if(!user)
        return res.status(400).json({ error: 'Invalid email.' });

    const validPassword = await user.comparePassword(password)

    if(!validPassword)
        return res.status(400).json({ error: 'Invalid password.' });

    sendTokens(res, user._id.toString());
    res.status(200).json(getUserObj(user));
}

const token = async (req, res) => {
    
    const { refreshToken } = req.cookies;

    if(!refreshToken)
        return res.status(401).json({ error: 'Refresh token not found' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {

        if(err)
            return res.status(403).json({ error: 'Invalid refresh token' });

        sendTokens(res, user.userId);
        res.status(204).send();
    });
}

module.exports = { signup, login, token };