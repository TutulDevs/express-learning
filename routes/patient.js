const express = require("express");
const router = express.Router();
const {
  createPatient,
  getAllPatients,
  getPatientByIdOrPhone,
} = require("../controllers/patientController");

// create patient
router.post("/", createPatient);

// get all
router.get("/", getAllPatients);

// get by id
router.get("/:id", getPatientByIdOrPhone);

// update

// delete

module.exports = router;
