const express = require("express");
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorLoggedIn,
  updateDoctorById,
  deleteDoctor,
} = require("../controllers/doctorController");

// read all doctors
router.get("/", getAllDoctors);

// get doctor by id
router.get("/:id", getDoctorById);

// update logged in user
router.put("/", updateDoctorLoggedIn);

// update by id
router.put("/:id", updateDoctorById);

// delete
router.delete("/:id", deleteDoctor);

module.exports = router;
