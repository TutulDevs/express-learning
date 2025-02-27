const express = require("express");
const router = express.Router();
const db = require("../libraries/Database");

// get user by id
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  // const record = await db.query(`SELECT * FROM users WHERE userid = $1`, [id]);

  let record = await db.query(
    `
    SELECT
      users.userid::VARCHAR,
      users.firstname,
      users.lastname,
      users.email,
      users.phone
    FROM
      users
    LEFT JOIN
      organisation_user ON organisation_user.userid::VARCHAR = users.userid::VARCHAR
    LEFT JOIN
      organisation ON organisation.orgid::VARCHAR = organisation_user.orgid::VARCHAR
    WHERE
      users.userid::VARCHAR = $1 AND organisation_user.orgid::VARCHAR = $2
    `,
    [id, userId]
  );

  console.log("user id: ", record);

  if (record.rowCount > 0) {
    let { userid, firstname, lastname, email, phone } = record.rows[0];

    return res.status(200).json({
      code: 200,
      message: "Fetched successful",
      data: {
        userId: userid,
        firstName: firstname,
        lastName: lastname,
        email,
        phone,
      },
    });
  } else {
    return res
      .status(400)
      .json({ code: 400, status: "Bad request", message: "Client Error" });
  }
});

// get organisations
router.get("/organisations", async (req, res) => {
  const userId = req.userId;

  let record = await db.query(
    `
    SELECT
      organisation.orgid::VARCHAR,
      organisation.name::VARCHAR,
      organisation.description::VARCHAR
    FROM organisation
    LEFT JOIN organisation_user ON
      organisation_user.orgid::VARCHAR = organisation.orgid::VARCHAR
    WHERE
      organisation_user.userid::VARCHAR = $1
    `,
    [userId]
  );

  if (record.rowCount > 0) {
    const list = record.rows.map((e) => {
      e.orgId = e.orgid;
      delete e.orgid;
      return e;
    });

    return res.status(200).json({
      message: "Fetched organisations",
      data: {
        organisations: list,
      },
    });
  } else {
    return res
      .status(400)
      .json({ code: 400, status: "Bad request", message: "Client error" });
  }
});

module.exports = router;
