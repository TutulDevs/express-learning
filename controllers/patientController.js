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
  const id = req.params.id;
  const isPhone = parseInt(id).toString().length == 10;

  try {
    const patientsQuery = await db.query(
      `
      SELECT * FROM patients
      WHERE phone::TEXT = $1 OR id::TEXT = $1
      `,
      [!isPhone ? id : parseInt(id)]
    );

    if (patientsQuery.rowCount == 0) {
      return res.status(404).json({
        code: 404,
        message: "Patient not found.",
      });
    }

    res.status(200).json({ data: patientsQuery.rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message || "Something went wrong" });
  }
};

// update patient by id
const updatePatientById = async (req, res) => {
  const id = String(req.params.id);

  try {
    // check full_name in the body
    const { phone, age, full_name } = req.body;

    const errs = [];

    // phone
    if (phone && phone?.length != 11)
      errs.push("Phone number should be 11 digits");

    if (errs.length > 0) {
      return res
        .status(400)
        .json({ code: 400, message: errs[0], messages: errs });
    }

    // check if doctor
    const patientQuery = await db.query(
      `
      SELECT phone, age, full_name FROM patients
      WHERE id = $1
      `,
      [id]
    );

    if (patientQuery.rowCount == 0) {
      return res.status(404).json({ code: 404, message: "Patient not found!" });
    }

    const patient = patientQuery.rows[0];
    const _phone = phone ?? patient.phone;
    const _age = age == null || age == undefined ? patient.age : age;
    const _full_name = full_name ?? patient.full_name;

    // update
    const updateQuery = await db.query(
      `
      UPDATE patients
      SET 
        phone = $1,
        age = $2,
        full_name = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [_phone, _age, _full_name, id]
    );

    if (updateQuery.rowCount == 0) {
      return res
        .status(400)
        .json({ code: 400, message: "Could not update patient" });
    }

    res.status(200).json({
      code: 200,
      message: "Updated successfully",
      data: updateQuery.rows[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message || "Something went wrong" });
  }
};

// delete patient
const deletePatient = async (req, res) => {
  const id = String(req.params.id);

  try {
    // check user
    const docQuery = await db.query(
      `
      SELECT phone FROM patients
      WHERE id = $1
      `,
      [id]
    );

    if (docQuery.rowCount == 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Patient not found to delete." });
    }

    // delete
    const delQuery = await db.query(
      `
      DELETE FROM patients
      WHERE id = $1
      `,
      [id]
    );

    if (delQuery.rowCount == 0) {
      return res
        .status(400)
        .json({ code: 400, message: "Error deleting patient" });
    }

    res.status(200).json({ code: 200, message: "Deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message || "Something went wrong" });
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientByIdOrPhone,
  updatePatientById,
  deletePatient,
};
