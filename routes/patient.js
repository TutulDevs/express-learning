const express = require("express");
const router = express.Router();
const {
  createPatient,
  getAllPatients,
  getPatientByIdOrPhone,
  updatePatientById,
  deletePatient,
} = require("../controllers/patientController");

// create patient
router.post("/", createPatient);

// get all
router.get("/", getAllPatients);

// get by id
router.get("/:id", getPatientByIdOrPhone);

// update
router.put("/:id", updatePatientById);

// delete
router.delete("/:id", deletePatient);

module.exports = router;
