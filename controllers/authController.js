const db = require("../libraries/Database");
const jwt = require("../libraries/JWT");
const crypto = require("crypto");
const { emailRegex, passwordRegex } = require("../helpers/coreconstants");

// register a doctor
const register = async (req, res) => {
  const { full_name, email, password } = req.body;

  let errors = [];

  // check full_name
  if (!full_name || full_name.length == 0) errors.push("Full name is required");

  // check email
  if (!email || email.length == 0) errors.push("Email is required");
  if (email && !emailRegex.test(email)) errors.push("Email is invalid");

  // check password
  if (!password || password.length == 0) errors.push("Password is required");
  if (password && !passwordRegex.test(password))
    errors.push(
      "Password is invalid. It should be at least 8 characters, one lowercase, one uppercase, one number and one special character."
    );

  if (errors.length > 0) {
    return res
      .status(422)
      .json({ code: 422, message: errors[0], messages: errors });
  }

  try {
    // check if email exists
    const userQuery = await db.query(
      `SELECT email FROM doctors WHERE email = $1`,
      [email]
    );
    const user = userQuery.rows[0];

    if (user) {
      return res.status(422).json({
        code: 422,
        message: "User with this email exists!",
        messages: ["User with this email exists!"],
      });
    }

    const hashedPassword = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");

    const createQuery = await db.query(
      `
      INSERT INTO doctors (email, password, full_name)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [email, hashedPassword, full_name]
    );

    // console.log("createQuery:", createQuery);

    res
      .status(201)
      .json({ code: 201, message: "Registration done. Please login." });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Something went wrong!" });
  }
};

// login a doctor
const login = async (req, res) => {};

module.exports = {
  register,
  login,
};
