const jwt = require("jsonwebtoken");
const config = require("../config");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  try {
    const bearerToken = token.split(" ")[1];

    const decoded = jwt.verify(bearerToken, config.auth.jwtSecret);

    req.user = decoded;
    req.id = decoded.id;

    return next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).send({ message: "Unauthorized!" });
  }
};

module.exports = verifyToken;
