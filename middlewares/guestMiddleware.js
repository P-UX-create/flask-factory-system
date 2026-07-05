const jwt = require("jsonwebtoken");

const verifyGuest = (req, res, next) => {
    
    const token = req.cookies?.token;

    if (!token) {
        return next();
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);

        // Valid token, user is already logged in
        return res.redirect("/dashboard");

    } catch (error) {
        // Invalid or expired token
        return next();
    }
};

module.exports = verifyGuest;