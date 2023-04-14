const jwt = require('jsonwebtoken');
const User = require('../model/user.js');

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id, 'tokens.token': token })
        if (!user) throw new Error("user not found");
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).send(err.message || 'User not authenticated');
    }

}

module.exports = auth;