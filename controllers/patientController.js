const db = require("../libraries/Database");

// create patient
const createPatient = async (req, res) => {
  try {
    const { phone, age, full_name } = req.body;

    const errs = [];

    // phone
    if (!phone) errs.push("Phone is required!");
    if (phone?.length != 11) errs.push("Phone number should be 11 digits");

    // age
    if (!age) errs.push("Age is required");

    // full name
    if (!full_name) errs.push("Full name is required");

    if (errs.length > 0) {
      return res
        .status(400)
        .json({ code: 400, message: errs[0], messages: errs });
    }

    // check patient
    const patientQuery = await db.query(
      `
      SELECT * FROM patients
      WHERE phone = $1
      `,
      [Number(phone)]
    );

    if (patientQuery.rowCount > 0) {
      return res.status(400).json({
        code: 400,
        message:
          "Patient exists with the phone. Try with a different phone number.",
      });
    }

    const createQuery = await db.query(
      `
      INSERT INTO patients (phone, age, full_name)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [Number(phone), age, full_name]
    );

    if (createQuery.rowCount == 0) {
      return res.status(400).json({
        code: 400,
        message: "Failed to create patient.",
      });
    }

    res
      .status(200)
      .json({ code: 200, message: "Patient created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message || "Something went wrong" });
  }
};

// get all patients
const getAllPatients = async (req, res) => {
  try {
    const patientsQuery = await db.query(`
      SELECT * FROM patients
      `);

    res
      .status(200)
      .json({ totalCount: patientsQuery.rowCount, data: patientsQuery.rows });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message || "Something went wrong" });
  }
};

// get patient by id
const getPatientByIdOrPhone = async (req, res) => {
  const id = String(req.params.id);

  try {
    const patientsQuery = await db.query(
      `
      SELECT * FROM patients
      WHERE phone = $1 OR id = $1
      `,
      [id]
    );

    res.status(200).json({ data: patientsQuery.rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message || "Something went wrong" });
  }
};

// update patient by id

// delete patient

module.exports = { createPatient, getAllPatients, getPatientByIdOrPhone };
