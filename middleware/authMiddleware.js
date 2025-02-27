require("dotenv").config();
const jwt = require("../libraries/JWT");
const db = require("../libraries/Database");

module.exports = async (req, res, next) => {
  let token = req.headers.authorization || req.headers.Authorization || "";
  // token = token.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      status: "Unauthorized",
      message: "Please login",
    });
  }

  try {
    let { userId } = await jwt.verifyToken(token);

    const user = await db.query(`SELECT email FROM users WHERE userid = $1`, [
      userId,
    ]);

    if (user.rowCount > 0) {
      req.userId = userId;
      return next();
    }

    return res.status(401).json({
      code: 401,
      status: "Unauthorized",
      message: "Please login",
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: "Bad request",
      message: error?.message ?? "Client error",
    });
  }
};
