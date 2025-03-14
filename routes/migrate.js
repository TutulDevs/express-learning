const express = require("express");
const router = express.Router();
const db = require("../libraries/Database");

router.all("/", async (req, res) => {
  // create doctors table
  await db.query(`
    DROP TABLE IF EXISTS doctors CASCADE;
    CREATE TABLE doctors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `);

  // create patients table
  await db.query(`
    DROP TABLE IF EXISTS patients CASCADE;
    CREATE TABLE patients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone INTEGER NOT NULL UNIQUE,
      age INTEGER NOT NULL,
      full_name VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `);

  // create prescriptions table
  await db.query(`
    DROP TABLE IF EXISTS prescriptions CASCADE;
    CREATE TABLE prescriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doctor_id UUID NOT NULL,
      patient_id UUID NOT NULL,
      medicines UUID[] NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
    `);

  // create medicine table
  await db.query(`
    DROP TABLE IF EXISTS medicines CASCADE;
    CREATE TABLE medicines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type INTEGER NOT NULL,
      title TEXT NOT NULL UNIQUE,
      company_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `);

  // medicines for prescriptions table
  await db.query(`
    DROP TABLE IF EXISTS prescription_medicines CASCADE;
    CREATE TABLE prescription_medicines (
      prescription_id UUID NOT NULL,
      medicine_id UUID NOT NULL,
      dosage DECIMAL[] NOT NULL,
      meal_before INTEGER,
      meal_after INTEGER, 
      to_days INTEGER,
      PRIMARY KEY (prescription_id, medicine_id),
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
    );
    `);

  res.status(201).json({
    message: "Migrated Successfully",
  });
});

module.exports = router;
