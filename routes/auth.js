const express = require("express");
const router = express.Router();
const db = require("../libraries/Database");
const jwt = require("../libraries/JWT");
const crypto = require("crypto");

// register
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  let errors = [];

  if (!firstName || firstName.lenght == 0) {
    errors.push({ field: "firstName", message: "First name is invalid" });
  }

  if (!lastName || lastName.lenght == 0) {
    errors.push({ field: "lastName", message: "Last name is invalid" });
  }

  if (!password || password.lenght == 0) {
    errors.push({ field: "password", message: "Password is invalid" });
  }

  if (
    !email ||
    email.lenght == 0 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.push({ field: "email", message: "Email is invalid" });
  }

  if (errors.length > 0) {
    return res
      .status(422)
      .json({ code: 422, message: errors[0], messages: errors });
  }

  // hash password
  const hashedPassword = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  return await db
    .query(
      `
    INSERT INTO users (firstName, lastName, email, password, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING userId
    `,
      [firstName, lastName, email, hashedPassword, phone]
    )
    .then(async (res) => {
      const record = res.rows[0];
      const userid = record.userid;
      // console.log("reg: record", userid, record);

      // const userid = await (
      //   await db.query(`SELECT userId AS userid FROM users WHERE email = $1`, [
      //     email,
      //   ])
      // ).rows[0];

      await db.query(
        `
      INSERT INTO organisation (orgid, name, owner, description)
      VALUES ($1, $2, $1, $3)
      `,
        [userid, `${firstName}'s Organisation`, ""]
      );
      await db.query(
        `
      INSERT INTO organisation_user(orgid, userid)
      VALUES ($1, $1)
      `,
        [userid]
      );

      const token = await jwt.generateToken({ userId: userid });

      return res.status(201).json({
        code: 201,
        status: "success",
        message: "Registration successful",
        data: {
          accessToken: token,
          user: {
            userId: "" + userid.userid,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone || "",
          },
        },
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({
        code: 400,
        status: "Bad request",
        message: "Registration failed!",
      });
    });
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length == 0
  ) {
    return res.status(401).json({
      status: "Bad request",
      message: "Authentication failed",
      code: 401,
    });
  }

  // hash password
  const hashedPassword = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  const user = await db.query(
    `SELECT * FROM users WHERE email = $1 AND password = $2`,
    [email, hashedPassword]
  );

  if (!user || user.rowCount == 0) {
    return res
      .status(401)
      .json({ code: 401, status: "Bad request", message: "Login failed!" });
  } else {
    let { userid, firstname, lastname, email, phone } = user.rows[0];

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful",
      data: {
        accessToken: await jwt.generateToken({ userId: userid }),
        user: {
          userId: "" + userid,
          firstname,
          lastname,
          email,
          phone,
        },
      },
    });
  }
});

module.exports = router;
