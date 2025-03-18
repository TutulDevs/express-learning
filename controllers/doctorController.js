const db = require("../libraries/Database");

// get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const docQuery = await db.query(
      `SELECT 
        id, full_name, email, created_at, updated_at 
        FROM doctors`
    );

    res
      .status(200)
      .json({ totalCount: docQuery.rowCount, data: docQuery.rows });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message ?? "Something went wrong!" });
  }
};

// get doctor by id
const getDoctorById = async (req, res) => {
  const id = String(req.params.id);

  try {
    const docQuery = await db.query(
      `SELECT 
        id, full_name, email, created_at, updated_at 
        FROM doctors
        WHERE id = $1`,
      [id]
    );

    if (docQuery.rowCount == 0) {
      return res
        .status(401)
        .json({ code: 401, message: "No doctor found with the id" });
    }

    res.status(200).json({ data: docQuery.rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message ?? "Something went wrong!" });
  }
};

// udpate doctor logged in
const updateDoctorLoggedIn = async (req, res) => {
  const id = req.userId;

  try {
    // check full_name in the body
    const { full_name } = req.body;

    if (!full_name || full_name.length == 0) {
      return res
        .status(400)
        .json({ code: 400, message: "Full name is required" });
    }

    // update
    const updateQuery = await db.query(
      `
      UPDATE doctors
      SET full_name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, full_name, email, created_at, updated_at
      `,
      [full_name, id]
    );

    if (updateQuery.rowCount == 0) {
      return res
        .status(400)
        .json({ code: 400, message: "Could not update doctor" });
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

// udpate doctor by id
const updateDoctorById = async (req, res) => {
  const id = String(req.params.id);

  try {
    // check full_name in the body
    const { full_name } = req.body;

    if (!full_name || full_name.length == 0) {
      return res
        .status(400)
        .json({ code: 400, message: "Full name is required" });
    }

    // check if doctor
    const docQuery = await db.query(
      `
      SELECT email FROM doctors
      WHERE id = $1
      `,
      [id]
    );

    if (docQuery.rowCount == 0) {
      return res.status(404).json({ code: 404, message: "Doctor not found!" });
    }

    // update
    const updateQuery = await db.query(
      `
      UPDATE doctors
      SET full_name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, full_name, email, created_at, updated_at
      `,
      [full_name, id]
    );

    if (updateQuery.rowCount == 0) {
      return res
        .status(400)
        .json({ code: 400, message: "Could not update doctor" });
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

// delete doctor
const deleteDoctor = async (req, res) => {
  const id = String(req.params.id);

  try {
    // check user
    const docQuery = await db.query(
      `
      SELECT email FROM doctors
      WHERE id = $1
      `,
      [id]
    );

    if (docQuery.rowCount == 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Doctor not found to delete." });
    }

    // delete
    const delQuery = await db.query(
      `
      DELETE FROM doctors
      WHERE id = $1
      `,
      [id]
    );

    if (delQuery.rowCount == 0) {
      return res
        .status(400)
        .json({ code: 400, message: "Error deleting doctor" });
    }

    res.status(200).json({ code: 200, message: "Deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: error?.message || "Something went wrong" });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorLoggedIn,
  updateDoctorById,
  deleteDoctor,
};
