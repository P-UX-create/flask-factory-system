const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        return next();
    } catch (err) {
        return res.redirect("/");
    }
};

module.exports = requireAuth;