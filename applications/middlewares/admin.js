const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async function(req, res, next) {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middelware)
    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
        //if can verify the token, set req.user and pass to next middleware
        const decoded = jwt.verify(token, config.get("myprivatekey"));
        var user = await User.findById(decoded._id)
        if(!user) res.status(400).send("Invalid token.");

        if(decoded.isAdmin)
        {
            req.user = decoded;
            next();
        }
        else
            res.status(403).send("Unauthorized.");
    } catch (ex) {
        //if invalid token
        res.status(400).send("Invalid token.");
    }
};