import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { PassThrough } from "stream";
import { sendEmail } from "../utils/email.js";
import csv from "csv-parser";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

app.use(cors());
app.use(express.json());

function malaysiaNow() {
  const now = new Date();
  return new Date(now.getTime() + 8 * 60 * 60 * 1000);
}
function malaysiaYMD() {
  return malaysiaNow().toISOString().slice(0, 10);
}
function malaysiaHMS() {
  return malaysiaNow().toTimeString().slice(0, 8);
}

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "paviparam26@gmail.com",
    pass: "kozb jjua gfew dktx"
  }
});

const csvUpload = multer({ storage: multer.memoryStorage() });

// Create uploads folder if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const resumePdfDir = path.join(uploadDir, "resume_pdfs");
if (!fs.existsSync(resumePdfDir)) fs.mkdirSync(resumePdfDir, { recursive: true });

// ensure uploads folder exists
if (!fs.existsSync("uploads/documents")) {
  fs.mkdirSync("uploads/documents", { recursive: true });
}

/* =========================
   1) Normal upload (images, logos, etc.)
   ========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });

/* =========================
   2) Resume PDF upload (only PDF)
   ========================= */
const resumePdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumePdfDir),
  filename: (req, file, cb) => {
    const { resumeId } = req.params;
    cb(null, `resume_${resumeId}.pdf`);
  },
});

export const uploadResumePdf = multer({
  storage: resumePdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  },
});

const storageDocs = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/documents");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const uploadDocs = multer({ storage: storageDocs });

// Start server
async function startServer() {
  const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "internship_system",
  });

  app.post("/api/admin/students/import-csv", csvUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "CSV file is required" });
    }

    const results = [];
    const errors = [];

    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", async () => {
        let inserted = 0;

        for (let i = 0; i < results.length; i++) {
          const row = results[i];

          const student_id = String(row.student_id || "").trim();
          const name = String(row.name || "").trim();
          const email = String(row.email || "").trim();
          const password = String(row.password || "").trim();

          if (!student_id || !name || !email || !password) {
            errors.push(`Row ${i + 2}: Missing required fields`);
            continue;
          }

          try {
            await db.query(
              `INSERT INTO students
              (student_id, name, email, password, status, ic_number, course, gender, marital_status, age, contact_number, academic_advisor)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                student_id,
                name,
                email,
                password,
                "unemployed",
                "",
                "",
                "male",
                "single",
                18,
                "",
                "",
              ]
            );

            inserted++;
          } catch (err) {
            console.error("CSV insert row error:", err);
            errors.push(`Row ${i + 2}: Failed to insert (${email})`);
          }
        }

        return res.json({
          success: true,
          inserted,
          failed: errors.length,
          errors,
        });
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        return res.status(500).json({ success: false, message: "CSV parsing failed" });
      });
  } catch (err) {
    console.error("CSV import error:", err);
    res.status(500).json({ success: false, message: "CSV import failed" });
  }
});

// CREATE REMINDER (with optional file + send email immediately)
app.post("/api/admin/reminders", upload.single("attachment"), async (req, res) => {
  try {
    const { title, message, deadline } = req.body;
    let attachment = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO reminders (title, message, deadline, attachment) VALUES (?, ?, ?, ?)",
      [title, message, deadline, attachment]
    );

    // Send email immediately after creation
    const [students] = await db.query("SELECT email FROM students");
    for (let student of students) {
      await sendEmail(student.email, title, message, deadline, attachment);
    }

    res.json({ success: true, message: "Reminder created and emails sent!", id: result.insertId });
  } catch (err) {
    console.error("Create Reminder Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// LIST REMINDERS
app.get("/api/admin/reminders", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reminders ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("List Reminders Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// RESEND REMINDER
app.post("/api/admin/reminders/resend/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM reminders WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Reminder not found" });

    const reminder = rows[0];
    const [students] = await db.query("SELECT email FROM students");

    for (let student of students) {
      await sendEmail(student.email, reminder.title, reminder.message, reminder.attachment);
    }

    res.json({ success: true, message: "Reminder resent to all students!" });
  } catch (err) {
    console.error("Resend Reminder Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// HELPER: Schedule Reminder Email
function scheduleReminderEmail(reminderId, title, message, deadline, attachment = null) {
  const delay = new Date(deadline).getTime() - Date.now();
  if (delay > 0) {
    setTimeout(async () => {
      try {
        const [students] = await db.query("SELECT email FROM students");
        for (let student of students) {
          await sendEmail(student.email, title, message, attachment);
        }
        console.log(`Reminder ${reminderId} sent to students.`);
      } catch (err) {
        console.error("Scheduled Reminder Error:", err);
      }
    }, delay);
  }
}


  // ---------------------
  // LOGIN
  // ---------------------
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { role, email, password } = req.body;
      if (!role || !email || !password)
        return res.status(400).json({ success: false, message: "Missing fields" });

      let query = "";
      let params = [];

      if (role === "student") {
        query = `SELECT id, student_id, name, email, status, password FROM students WHERE email = ?`;
        params = [email];
      } else if (role === "admin") {
        query = `SELECT id, name, email, password FROM admins WHERE email = ?`;
        params = [email];
      } else if (role === "employer") {
        query = `SELECT id, company_name AS name, email, password FROM employers WHERE email = ?`;
        params = [email];
      } else {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }

      const [rows] = await db.query(query, params);
      if (rows.length === 0)
        return res.status(404).json({ success: false, message: "Email not found" });

      const user = rows[0];
      if (user.password !== password)
        return res.status(401).json({ success: false, message: "Incorrect password" });

      delete user.password;
      user.role = role;

      return res.json({ success: true, user });
    } catch (err) {
      console.error("Login Error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ---------------------
  // FORGOT PASSWORD
  // ---------------------
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email, role } = req.body;
      if (!email || !role)
        return res.status(400).json({ success: false, message: "Missing fields" });

      let table;
      if (role === "admin") table = "admins";
      else if (role === "student") table = "students";
      else if (role === "employer") table = "employers";
      else return res.status(400).json({ success: false, message: "Invalid role" });

      const [rows] = await db.query(`SELECT * FROM ?? WHERE email = ?`, [table, email]);
      if (rows.length === 0)
        return res.status(404).json({ success: false, message: "Email not found" });

      const token = crypto.randomBytes(20).toString("hex");
      await db.query(
        "INSERT INTO password_resets (email, role, token) VALUES (?, ?, ?)",
        [email, role, token]
      );

      console.log(`Demo reset link: http://localhost:3000/${role}/reset-password/${token}`);
      return res.json({ success: true, message: "Demo reset email sent!" });
    } catch (err) {
      console.error("Forgot Password Error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ---------------------
  // GET STUDENT PROFILE
  // ---------------------
  app.get("/api/students/:id", async (req, res) => {
    try {
      const studentId = req.params.id;
      const [rows] = await db.query(
        `SELECT id, student_id, name, email, ic_number, course, gender, marital_status, age, contact_number, academic_advisor, emergency_contact, profile_picture, status
         FROM students WHERE id = ?`,
        [studentId]
      );

      if (rows.length === 0)
        return res.status(404).json({ success: false, message: "Student not found" });

      return res.json(rows[0]);
    } catch (err) {
      console.error("Get Student Error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ---------------------
  // UPDATE STUDENT PROFILE
  // ---------------------
  app.put("/api/students/:id", upload.single("profile_picture"), async (req, res) => {
    try {
      const studentId = req.params.id;
      const {
        name,
        ic_number,
        course,
        gender,
        marital_status,
        age,
        contact_number,
        academic_advisor,
        emergency_contact,
      } = req.body;

      let profile_picture;
      if (req.file) {
        profile_picture = `/uploads/${req.file.filename}`;
      }

      const updateFields = {
        name,
        ic_number,
        course,
        gender,
        marital_status,
        age,
        contact_number,
        academic_advisor,
        emergency_contact,
      };

      if (profile_picture) updateFields.profile_picture = profile_picture;

      // Build dynamic SET query
      const setClause = Object.keys(updateFields)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updateFields);

      await db.query(`UPDATE students SET ${setClause} WHERE id = ?`, [...values, studentId]);

      return res.json({ success: true, message: "Profile updated successfully!" });
    } catch (err) {
      console.error("Update Student Error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });


// GET ALL STUDENTS (FULL DATA FOR ADMIN)
app.get("/api/admin/students", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        rp.resume_pdf_path
      FROM students s
      LEFT JOIN resume_profiles rp
        ON rp.id = s.generated_resume_id
      ORDER BY s.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

app.post("/api/admin/students", async (req, res) => {
  try {
    const {
      student_id,
      name,
      email,
      password,
      status,
      ic_number,
      course,
      gender,
      marital_status,
      age,
      contact_number,
      academic_advisor,
      emergency_contact,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO students
      (student_id, name, email, password, status, ic_number, course, gender, marital_status, age, contact_number, academic_advisor, emergency_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        name,
        email,
        password || "123456",
        status,
        ic_number,
        course,
        gender,
        marital_status,
        age,
        contact_number,
        academic_advisor,
        emergency_contact || "",
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Insert failed" });
  }
});


app.put("/api/admin/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      student_id,
      name,
      email,
      password,
      status,
      ic_number,
      course,
      gender,
      marital_status,
      age,
      contact_number,
      academic_advisor,
      emergency_contact,
    } = req.body;

    if (password && String(password).trim() !== "") {
      await db.query(
        `UPDATE students SET
          student_id = ?,
          name = ?,
          email = ?,
          password = ?,
          status = ?,
          ic_number = ?,
          course = ?,
          gender = ?,
          marital_status = ?,
          age = ?,
          contact_number = ?,
          academic_advisor = ?,
          emergency_contact = ?
        WHERE id = ?`,
        [
          student_id,
          name,
          email,
          password,
          status,
          ic_number,
          course,
          gender,
          marital_status,
          age,
          contact_number,
          academic_advisor,
          emergency_contact || "",
          id,
        ]
      );
    } else {
      await db.query(
        `UPDATE students SET
          student_id = ?,
          name = ?,
          email = ?,
          status = ?,
          ic_number = ?,
          course = ?,
          gender = ?,
          marital_status = ?,
          age = ?,
          contact_number = ?,
          academic_advisor = ?,
          emergency_contact = ?
        WHERE id = ?`,
        [
          student_id,
          name,
          email,
          status,
          ic_number,
          course,
          gender,
          marital_status,
          age,
          contact_number,
          academic_advisor,
          emergency_contact || "",
          id,
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});


app.delete("/api/admin/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM students WHERE id = ?", [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// GET ALL EMPLOYER (FULL DATA FOR ADMIN)
app.get("/api/admin/employers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employers ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

app.post("/api/admin/employers", upload.single("company_logo"), async (req, res) => {
  try {
    const {
      company_name,
      headquarters,
      website_url,
      email,
      contact_number,
      year_founded,
      industry,
      fax,
      office_hours,
      description,
      password
    } = req.body;

    let logoPath = null;
    if (req.file) logoPath = `/uploads/${req.file.filename}`;

    const [result] = await db.query(
      `INSERT INTO employers 
      (company_name, headquarters, website_url, email, contact_number, year_founded, industry, fax, office_hours, description, company_logo, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name,
        headquarters,
        website_url,
        email,
        contact_number,
        year_founded,
        industry,
        fax,
        office_hours,
        description,
        logoPath,
        password || "123456"
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Insert failed" });
  }
});

app.put("/api/admin/employers/:id", upload.single("company_logo"), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      company_name,
      headquarters,
      website_url,
      email,
      contact_number,
      year_founded,
      industry,
      fax,
      office_hours,
      description,
    } = req.body;

    let updateFields = {
      company_name,
      headquarters,
      website_url,
      email,
      contact_number,
      year_founded,
      industry,
      fax,
      office_hours,
      description,
    };

    if (req.file) {
      updateFields.company_logo = `/uploads/${req.file.filename}`;
    }

    const setClause = Object.keys(updateFields)
      .map((k) => `${k} = ?`)
      .join(", ");

    const values = Object.values(updateFields);

    await db.query(
      `UPDATE employers SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/api/admin/employers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM employers WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// =====================
// ADMIN MANAGEMENT
// =====================
// GET CURRENT ADMIN PROFILE
app.get("/api/admin/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT id, name, email, contact_number, department, office_hours, profile_picture, created_at
       FROM admins
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get Admin Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE CURRENT ADMIN PROFILE
app.put(
  "/api/admin/profile/:id",
  upload.single("profile_picture"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        email,
        contact_number,
        department,
        office_hours,
      } = req.body || {};

      let updateFields = {
        name,
        email,
        contact_number,
        department,
        office_hours,
      };

      if (req.file) {
        updateFields.profile_picture = `/uploads/${req.file.filename}`;
      }

      // remove undefined values
      Object.keys(updateFields).forEach(
        (key) => updateFields[key] === undefined && delete updateFields[key]
      );

      const setClause = Object.keys(updateFields)
        .map((k) => `${k} = ?`)
        .join(", ");

      const values = Object.values(updateFields);

      await db.query(
        `UPDATE admins SET ${setClause} WHERE id = ?`,
        [...values, id]
      );

      res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
      console.error("Update Admin Profile Error:", err);
      res.status(500).json({ message: "Update failed" });
    }
  }
);

app.get("/api/admin/admins", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, contact_number, department, office_hours, created_at
       FROM admins
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Get Admins Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/admin/admins", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      contact_number,
      department,
      office_hours,
    } = req.body;

    await db.query(
      `INSERT INTO admins
      (name, email, password, contact_number, department, office_hours)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        password || "123456",
        contact_number,
        department,
        office_hours,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Create Admin Error:", err);
    res.status(500).json({ message: "Insert failed" });
  }
});

app.put("/api/admin/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      contact_number,
      department,
      office_hours,
    } = req.body;

    await db.query(
      `UPDATE admins SET
        name = ?,
        email = ?,
        contact_number = ?,
        department = ?,
        office_hours = ?
       WHERE id = ?`,
      [
        name,
        email,
        contact_number,
        department,
        office_hours,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update Admin Error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/api/admin/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM admins WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Admin Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// GET current employer profile
app.get("/api/employers/profile/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query(
    "SELECT * FROM employers WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Employer not found" });
  res.json(rows[0]);
});

// UPDATE current employer profile
app.put("/api/employers/profile/:id", upload.single("company_logo"), async (req, res) => {
  const { id } = req.params;
  const { company_name, contact_number, headquarters, website_url, year_founded, industry, office_hours, description } = req.body;

  let updateFields = { company_name, contact_number, headquarters, website_url, year_founded, industry, office_hours, description };
  if (req.file) updateFields.company_logo = `/uploads/${req.file.filename}`;

  Object.keys(updateFields).forEach(k => updateFields[k] === undefined && delete updateFields[k]);

  const setClause = Object.keys(updateFields).map(k => `${k} = ?`).join(", ");
  const values = Object.values(updateFields);

  await db.query(`UPDATE employers SET ${setClause} WHERE id = ?`, [...values, id]);
  res.json({ success: true, message: "Profile updated successfully" });
});

// POST a new job (employer creates a job)
app.post("/api/employers/jobs", async (req, res) => {
  try {
    const {
      employer_id,
      job_title,
      job_type,
      category,
      work_mode,
      description,
      requirements,
      availability
    } = req.body;

    if (!employer_id || !job_title) {
      return res.status(400).json({ success: false, message: "Employer ID and Job Title are required" });
    }

    const [result] = await db.query(
      `INSERT INTO jobs
      (employer_id, job_title, job_type, category, work_mode, description, requirements, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employer_id, job_title, job_type, category, work_mode, description, requirements, availability || 1]
    );

    res.json({ success: true, message: "Job posted successfully!", job_id: result.insertId });
  } catch (err) {
    console.error("Create Job Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all jobs (with employer details)
app.get("/api/jobs", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT j.*, e.company_name, e.company_logo 
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      ORDER BY j.created_at DESC
    `);
    res.json({ success: true, jobs: rows });
  } catch (err) {
    console.error("Get Jobs Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/employers/:id/jobs", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT id, job_title, job_type, category, work_mode, description, requirements, availability, status, created_at
       FROM jobs
       WHERE employer_id = ?
       ORDER BY created_at DESC`,
      [id]
    );
    res.json({ jobs: rows });
  } catch (err) {
    console.error("Get Employer Jobs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE job details (edit job)
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      job_title,
      job_type,
      category,
      work_mode,
      description,
      requirements,
      availability,
      status // optional: open or closed
    } = req.body;

    const updateFields = {
      job_title,
      job_type,
      category,
      work_mode,
      description,
      requirements,
      availability,
      status
    };

    // Remove undefined values
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const setClause = Object.keys(updateFields)
      .map(key => `${key} = ?`)
      .join(", ");

    const values = Object.values(updateFields);

    await db.query(`UPDATE jobs SET ${setClause} WHERE id = ?`, [...values, id]);

    res.json({ success: true, message: "Job updated successfully!" });
  } catch (err) {
    console.error("Update Job Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/jobs/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["open","closed"].includes(status)) 
      return res.status(400).json({ success: false, message: "Invalid status" });

    const [result] = await db.query(
      "UPDATE jobs SET status = ? WHERE id = ?", 
      [status, id]
    );

    if (result.affectedRows === 0) 
      return res.status(404).json({ success: false, message: "Job not found or already has this status" });

    res.json({ success: true, message: `Job status updated to ${status}!` });
  } catch (err) {
    console.error("Update Job Status Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------
// Resume Step 1 Routes
// -----------------

// -----------------
// Resume Step 1 APIs
// -----------------

// 1️⃣ Create or get resume profile
app.post("/api/resume/create", async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "Missing studentId" });

    const [existing] = await db.query(
      `SELECT id, current_step, progress
       FROM resume_profiles
       WHERE student_id = ?
       ORDER BY progress DESC, current_step DESC, id DESC
       LIMIT 1`,
      [studentId]
    );

    if (existing.length > 0) {
      return res.json({
        resumeId: existing[0].id,
        currentStep: Number(existing[0].current_step || 1),
        progress: Number(existing[0].progress || 0),
      });
    }

    const [result] = await db.query(
      "INSERT INTO resume_profiles (student_id, current_step, progress) VALUES (?, 1, 0)",
      [studentId]
    );

    return res.json({ resumeId: result.insertId, currentStep: 1, progress: 0 });
  } catch (err) {
    console.error("Resume Create Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/resume/progress/:studentId", async (req, res) => {
  const { studentId } = req.params;

  const [rows] = await db.query(
    `SELECT id, current_step, progress
     FROM resume_profiles
     WHERE student_id = ?
     ORDER BY progress DESC, current_step DESC, id DESC
     LIMIT 1`,
    [studentId]
  );

  if (!rows.length) return res.json({ resumeId: null, currentStep: 1, progress: 0 });

  return res.json({
    resumeId: rows[0].id,
    currentStep: Number(rows[0].current_step || 1),
    progress: Number(rows[0].progress || 0),
  });
});

// 2️⃣ Fetch Step1
app.get("/api/resume/step1/:resumeId", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const [rows] = await db.query("SELECT * FROM resume_step1 WHERE resume_id = ?", [resumeId]);

    if (rows.length === 0) return res.json({ success: true, data: null });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 3️⃣ Save Step1
// 3️⃣ Save Step1
app.post("/api/resume/step1/save", async (req, res) => {
  try {
    const {
      resumeId,
      fullName,
      dob,
      gender,
      contactNumber,
      email,
      linkedin,
      github,
      address,
      careerObjective,
      course,
      education,
      projects,
      experiences,
      technicalSkills,
      softSkills,
      languages,
      draft,
    } = req.body;

    if (!resumeId) return res.status(400).json({ message: "Missing resumeId" });

    const eduJson = JSON.stringify(Array.isArray(education) ? education : []);
    const projJson = JSON.stringify(Array.isArray(projects) ? projects : []);
    const expJson = JSON.stringify(Array.isArray(experiences) ? experiences : []);

    const [existing] = await db.query(
      "SELECT resume_id FROM resume_step1 WHERE resume_id = ?",
      [resumeId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE resume_step1 SET 
          full_name=?, dob=?, gender=?, phone=?, email=?, linkedin=?, github=?,
          address=?, career_objective=?, 
          education=?, projects=?, experience=?,
          technical_skills=?, soft_skills=?, languages=?,
          course=?
        WHERE resume_id=?`,
        [
          fullName, dob, gender, contactNumber, email, linkedin, github,
          address, careerObjective,
          eduJson, projJson, expJson,
          technicalSkills || "", softSkills || "", languages || "",
          course || "",
          resumeId,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO resume_step1
        (resume_id, full_name, dob, gender, phone, email, linkedin, github, address, career_objective,
         education, projects, experience,
         technical_skills, soft_skills, languages,
         course)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resumeId, fullName, dob, gender, contactNumber, email, linkedin, github,
          address, careerObjective,
          eduJson, projJson, expJson,
          technicalSkills || "", softSkills || "", languages || "",
          course || "",
        ]
      );
    }

    // ✅ IMPORTANT: update resume_profiles only when NOT draft
    if (!draft) {
      const nextStep = 2;
      const nextProgress = 20; // choose your own scale

      await db.query(
        `UPDATE resume_profiles
         SET 
           current_step = GREATEST(COALESCE(current_step, 1), ?),
           progress = GREATEST(COALESCE(progress, 0), ?),
           updated_at = NOW()
         WHERE id = ?`,
        [nextStep, nextProgress, resumeId]
      );
    }

    res.json({ success: true, message: draft ? "Draft saved" : "Step 1 saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------
// SAVE STEP 2 ANSWERS
// -------------------------
app.post("/api/resume/:resumeId/step2", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers must be an array" });
    }

    const answersJSON = JSON.stringify(answers);

    // Save to resume_step2
    const [rows] = await db.query("SELECT * FROM resume_step2 WHERE resume_id = ?", [resumeId]);

    if (rows.length > 0) {
      await db.query("UPDATE resume_step2 SET answers = ? WHERE resume_id = ?", [answersJSON, resumeId]);
    } else {
      await db.query("INSERT INTO resume_step2 (resume_id, answers) VALUES (?, ?)", [resumeId, answersJSON]);
    }

    // Save/update in resume_step2_results
    const [resultRows] = await db.query("SELECT * FROM resume_step2_results WHERE resume_id = ?", [resumeId]);

    if (resultRows.length > 0) {
      await db.query("UPDATE resume_step2_results SET answers = ? WHERE resume_id = ?", [answersJSON, resumeId]);
    } else {
      await db.query(
        `INSERT INTO resume_step2_results
         (resume_id, fluencyScore, level, feedback, overallPercentage, answers)
         VALUES (?, 0, 'N/A', '[]', 0, ?)`,
        [resumeId, answersJSON]
      );
    }

    // ✅ NEW: update resume_profiles progress + current_step
    await db.query(
      `
      UPDATE resume_profiles
      SET
        current_step = GREATEST(COALESCE(current_step, 1), 3),
        progress     = GREATEST(COALESCE(progress, 0), 40),
        updated_at   = NOW()
      WHERE id = ?
      `,
      [resumeId]
    );

    res.json({ success: true, message: "Step 2 answers saved!" });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ success: false, message: "DB save failed" });
  }
});

// -------------------------
// GET STEP 2 RESULTS & AI EVALUATION
// -------------------------
app.get("/api/resume/:resumeId/step2/result", async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Get saved answers
    const [rows] = await db.query(
      "SELECT answers FROM resume_step2 WHERE resume_id = ?",
      [resumeId]
    );

    if (!rows.length || !JSON.parse(rows[0].answers || "[]").length) {
      return res.json({
        success: true,
        fluencyScore: 0,
        level: "N/A",
        feedback: ["No answers submitted"],
        contribution: 0
      });
    }

    const answers = JSON.parse(rows[0].answers);

    // Prepare AI prompt
    const prompt = `
Evaluate English speaking ability.

STRICT RULES:
- Score must be between 0 and 10
- Return ONLY JSON
- No explanation

Format:
{
  "fluencyScore": number,
  "level": "Beginner | Intermediate | Advanced",
  "feedback": ["point1","point2","point3"]
}

Answers:
${answers.join("\n")}
`;

    // Call OpenAI
    let aiResult;
    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [{ role: "user", content: prompt }]
      });
      aiResult = JSON.parse(aiResponse.choices[0].message.content);
    } catch (err) {
      console.error("AI PARSE ERROR:", err);
      aiResult = {
        fluencyScore: 5,
        level: "Intermediate",
        feedback: ["Evaluation fallback used"]
      };
    }

    // Ensure score is within 0-10
    const score = Math.max(0, Math.min(10, Number(aiResult.fluencyScore)));
    const contribution = Number((score * 2).toFixed(2)); // 10 → 20%

    // Save step score
    await db.query(
      `INSERT INTO resume_step_scores (resume_id, step_number, score, contribution)
       VALUES (?, 2, ?, ?)
       ON DUPLICATE KEY UPDATE score=?, contribution=?`,
      [resumeId, score, contribution, score, contribution]
    );

    // --- Save AI evaluation into resume_step2_results ---
    await db.query(
      `INSERT INTO resume_step2_results
         (resume_id, fluencyScore, level, feedback, overallPercentage)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         fluencyScore = VALUES(fluencyScore),
         level = VALUES(level),
         feedback = VALUES(feedback),
         overallPercentage = VALUES(overallPercentage)`,
      [resumeId, score, aiResult.level, JSON.stringify(aiResult.feedback), contribution]
    );

    // Send response
    res.json({
      success: true,
      fluencyScore: score,
      level: aiResult.level,
      feedback: aiResult.feedback,
      contribution
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ success: false, message: "Evaluation failed" });
  }
});

// -------------------------
// SAVE STEP 3 ANSWERS
// -------------------------
app.post("/api/resume/:resumeId/step3/save", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers must be an array" });
    }

    const answersJSON = JSON.stringify(answers);

    // Save to resume_step3 table
    const [rows] = await db.query("SELECT * FROM resume_step3 WHERE resume_id = ?", [resumeId]);
    if (rows.length > 0) {
      await db.query("UPDATE resume_step3 SET answers = ? WHERE resume_id = ?", [answersJSON, resumeId]);
    } else {
      await db.query("INSERT INTO resume_step3 (resume_id, answers) VALUES (?, ?)", [resumeId, answersJSON]);
    }

    res.json({ success: true, message: "Step 3 answers saved!" });

  } catch (err) {
    console.error("Save Step3 Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/// RESUME STEP 3: AI Questions Generation
app.get("/api/resume/:resumeId/step3/questions", async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Fetch student skills/course
    const [rows] = await db.query(
      "SELECT technical_skills, experience, course FROM resume_step1 WHERE resume_id = ?",
      [resumeId]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Resume not found" });

    const step1 = rows[0];
    const technicalSkills = step1.technical_skills || "programming, databases, web development";
    const course = step1.course || "Computer Science";
    const experience = step1.experience || "No prior experience";

    // AI prompt
    const prompt = `
You are a career coach generating a skill assessment quiz for a student.

Student Info:
- Course: ${course}
- Technical Skills: ${technicalSkills}
- Experience: ${experience}

Requirements:
1. Generate 10 multiple-choice questions.
2. Each question must have 4 realistic answer options.
3. 1 or 2 options should be correct.
4. Return ONLY JSON in this format:

[
  {
    "question": "string",
    "options": ["string","string","string","string"],
    "correctOptions": ["string"]
  }
]

Make questions professional, clear, and relevant.
`;

    let questions = [];

    try {
      const aiResponse = await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages: [{ role: "user", content: prompt }],
});
      questions = JSON.parse(aiResponse.choices[0].message.content);
    } catch (err) {
      console.error("AI PARSE ERROR, using fallback:", err);
      // Fallback questions if AI fails
      questions = Array.from({ length: 10 }, (_, i) => ({
        question: `Fallback Question ${i + 1} about ${course}`,
        options: [
          `Option A${i + 1}`,
          `Option B${i + 1}`,
          `Option C${i + 1}`,
          `Option D${i + 1}`
        ],
        correctOptions: [`Option A${i + 1}`]
      }));
    }

    // Save generated questions in DB
    await db.query(
  `INSERT INTO resume_step3 (resume_id, questions, answers) VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE questions=?, answers=?`,
  [resumeId, JSON.stringify(questions), JSON.stringify([]), JSON.stringify(questions), JSON.stringify([])]
);

    res.json({ success: true, questions });

  } catch (err) {
    console.error("Step3 Questions Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------
// SAVE STEP 3 RESULTS
// -------------------------
app.post("/api/resume/:resumeId/step3/result", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { answers, score, contribution } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers must be an array" });
    }

    // Fetch questions
    const [questionsRows] = await db.query(
      "SELECT questions FROM resume_step3 WHERE resume_id = ?",
      [resumeId]
    );
    if (!questionsRows.length) {
      return res.status(404).json({ success: false, message: "Questions not found" });
    }
    const questions = JSON.parse(questionsRows[0].questions);

    // Generate feedback
    const feedback = answers.map((a, idx) => {
      const correct = questions[a.questionIndex].correctOptions;
      const selected = a.selectedOptions;
      const isCorrect =
        selected.every(opt => correct.includes(opt)) &&
        correct.every(opt => selected.includes(opt));
      return `Q${idx + 1}: ${isCorrect ? "Correct" : `Incorrect. Correct: ${correct.join(", ")}`}`;
    });

    // Save results in resume_step3_results
    const [existing] = await db.query(
      "SELECT * FROM resume_step3_results WHERE resume_id = ?",
      [resumeId]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE resume_step3_results SET answers = ?, score = ?, contribution = ?, feedback = ? WHERE resume_id = ?",
        [JSON.stringify(answers), score, contribution, JSON.stringify(feedback), resumeId]
      );
    } else {
      await db.query(
        "INSERT INTO resume_step3_results (resume_id, answers, score, contribution, feedback) VALUES (?, ?, ?, ?, ?)",
        [resumeId, JSON.stringify(answers), score, contribution, JSON.stringify(feedback)]
      );
    }

    // Also save to resume_step_scores
    await db.query(
      `INSERT INTO resume_step_scores (resume_id, step_number, score, contribution)
       VALUES (?, 3, ?, ?)
       ON DUPLICATE KEY UPDATE score = ?, contribution = ?`,
      [resumeId, score, contribution, score, contribution]
    );

    res.json({ success: true, score, contribution, feedback });
  } catch (err) {
    console.error("Step3 Result Save Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// -------------------------
// GET STEP 3 RESULT
// -------------------------
app.get("/api/resume/:resumeId/step3/result", async (req, res) => {
  try {
    const { resumeId } = req.params;

    const [rows] = await db.query(
      "SELECT score, contribution, feedback, answers FROM resume_step3_results WHERE resume_id = ?",
      [resumeId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    const result = rows[0];
    res.json({
      success: true,
      score: Number(result.score),
      contribution: Number(result.contribution),
      feedback: JSON.parse(result.feedback),
      answers: JSON.parse(result.answers)
    });
  } catch (err) {
    console.error("Step3 Result Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------
// SAVE STEP 4 ANSWERS
// -------------------------
app.post("/api/resume/:resumeId/step4/save", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers must be an array" });
    }

    const answersJSON = JSON.stringify(answers);

    // Get existing Step 4 entry
    const [rows] = await db.query("SELECT * FROM resume_step4 WHERE resume_id = ?", [resumeId]);

    let questions = [];

    if (rows.length > 0) {
      // Use existing questions
      questions = JSON.parse(rows[0].questions || "[]");
      await db.query(
        "UPDATE resume_step4 SET answers = ? WHERE resume_id = ?",
        [answersJSON, resumeId]
      );
    } else {
      // No entry yet, generate fallback questions
      questions = Array.from({ length: 10 }, (_, i) => ({
        question: `Fallback Question ${i + 1}`,
        options: [`Option A${i+1}`, `Option B${i+1}`, `Option C${i+1}`, `Option D${i+1}`],
        correctOptions: [`Option A${i+1}`],
      }));

      await db.query(
        "INSERT INTO resume_step4 (resume_id, answers, questions) VALUES (?, ?, ?)",
        [resumeId, answersJSON, JSON.stringify(questions)]
      );
    }

    res.json({ success: true, message: "Step 4 answers saved!", questions });
  } catch (err) {
    console.error("Save Step4 Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------
// SAVE STEP 4 RESULT (Auto Score Calculation)
// -------------------------
app.post("/api/resume/:resumeId/step4/result", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers must be an array" });
    }

    // Get questions from DB
    const [rows] = await db.query(
      "SELECT questions FROM resume_step4 WHERE resume_id = ? ORDER BY updated_at DESC, id DESC LIMIT 1",
      [resumeId]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Questions not found" });

    const questions = JSON.parse(rows[0].questions);

    const totalQuestions = questions.length;
    let correctCount = 0;

    // Generate feedback and calculate correct answers
    const feedback = answers.map((a, idx) => {
      const question = questions[a.questionIndex];
      if (!question) return `Q${idx + 1}: Question missing`;

      const correct = question.correctOptions || [];
      const selected = a.selectedOptions || [];

      const isCorrect =
        selected.length &&
        selected.every(opt => correct.includes(opt)) &&
        correct.every(opt => selected.includes(opt));

      if (isCorrect) correctCount++;

      return `Q${idx + 1}: ${isCorrect ? "Correct" : `Incorrect. Correct: ${correct.join(", ")}`}`;
    });

    // Auto-calculated score & contribution
    const score = correctCount;
    const contribution = totalQuestions ? (score / totalQuestions) * 10 : 0;

    // Save in results table
    const [existing] = await db.query(
      "SELECT * FROM resume_step4_results WHERE resume_id = ?",
      [resumeId]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE resume_step4_results SET answers=?, score=?, contribution=?, feedback=? WHERE resume_id=?",
        [JSON.stringify(answers), score, contribution, JSON.stringify(feedback), resumeId]
      );
    } else {
      await db.query(
        "INSERT INTO resume_step4_results (resume_id, answers, score, contribution, feedback) VALUES (?, ?, ?, ?, ?)",
        [resumeId, JSON.stringify(answers), score, contribution, JSON.stringify(feedback)]
      );
    }

    // Also save in step_scores table
    await db.query(
      `INSERT INTO resume_step_scores (resume_id, step_number, score, contribution)
       VALUES (?, 4, ?, ?)
       ON DUPLICATE KEY UPDATE score = ?, contribution = ?`,
      [resumeId, score, contribution, score, contribution]
    );

    res.json({ success: true, score, contribution, feedback });
  } catch (err) {
    console.error("Step4 Result Save Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// -------------------------
// GENERATE STEP 4 QUESTIONS
// -------------------------
app.get("/api/resume/:resumeId/step4/questions", async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Get student's course & experience
    const [rows] = await db.query(
      "SELECT course, experience FROM resume_step1 WHERE resume_id = ?",
      [resumeId]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Resume not found" });

    const { course, experience } = rows[0];

    // AI prompt
    const prompt = `
You are generating an Experience Assessment quiz for a student.
- Course: ${course || "Computer Science"}
- Experience: ${experience || "No prior experience"}
Requirements:
1. 10 multiple-choice questions
2. 4 options each, 1-2 correct
3. Return ONLY JSON as:
[
  {
    "question": "string",
    "options": ["string","string","string","string"],
    "correctOptions": ["string"]
  }
]
`;

    let questions = [];
    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [{ role: "user", content: prompt }],
      });
      questions = JSON.parse(aiResponse.choices[0].message.content);
    } catch (err) {
      console.error("AI Parse Error, using fallback", err);
      questions = Array.from({ length: 10 }, (_, i) => ({
        question: `Fallback Question ${i + 1}`,
        options: [`Option A${i+1}`, `Option B${i+1}`, `Option C${i+1}`, `Option D${i+1}`],
        correctOptions: [`Option A${i+1}`],
      }));
    }

    // Save questions in DB
    await db.query(
      `INSERT INTO resume_step4 (resume_id, questions, answers) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE questions = ?, answers = ?`,
      [resumeId, JSON.stringify(questions), JSON.stringify([]), JSON.stringify(questions), JSON.stringify([])]
    );

    res.json({ success: true, questions });
  } catch (err) {
    console.error("Step4 Questions Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// -------------------------
// GET STEP 4 RESULT
// -------------------------
app.get("/api/resume/:resumeId/step4/result", async (req, res) => {
  try {
    const { resumeId } = req.params;

    const [rows] = await db.query(
      "SELECT score, contribution, feedback, answers FROM resume_step4_results WHERE resume_id = ?",
      [resumeId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Step 4 result not found" });
    }

    const result = rows[0];
    res.json({
      success: true,
      score: Number(result.score),
      contribution: Number(result.contribution),
      feedback: JSON.parse(result.feedback),
      answers: JSON.parse(result.answers),
    });
  } catch (err) {
    console.error("Step4 Result Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Get Step 1 Data ---
app.get("/api/resume/:resumeId/step1", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const [step1Data] = await db.query(
      "SELECT * FROM resume_steps WHERE resume_id = ? AND step_number = 1",
      [resumeId]
    );
    res.json({ success: true, data: step1Data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// --- Get Step 3-5 Contribution ---
app.get("/api/resume/:resumeId/contribution", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const [contributions] = await db.query(
      "SELECT step_number, contribution FROM resume_steps WHERE resume_id = ? AND step_number BETWEEN 3 AND 5",
      [resumeId]
    );
    res.json({ success: true, data: contributions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// --- Generate Resume ---
app.post("/api/resume/:resumeId/generate", async (req, res) => {
  const resumeId = Number(req.params.resumeId);
  const templateId = Number(req.body.templateId);

  if (!Number.isFinite(resumeId) || resumeId <= 0) {
    return res.status(400).json({ success: false, error: "Invalid resumeId" });
  }
  if (!Number.isFinite(templateId) || ![1, 2, 3].includes(templateId)) {
    return res.status(400).json({ success: false, error: "Invalid templateId" });
  }

  try {
    // ✅ 1) make sure resume exists
    const [exists] = await db.query(
      "SELECT id FROM resume_profiles WHERE id = ? LIMIT 1",
      [resumeId]
    );

    if (!exists.length) {
      return res.status(404).json({ success: false, error: "Resume not found" });
    }

    // ✅ 2) SAVE selected template into resume_profiles
    await db.query(
      "UPDATE resume_profiles SET selected_template = ?, current_step = 5, progress = 100 WHERE id = ?",
      [templateId, resumeId]
    );

    // ✅ 3) Insert generation record
    const [result] = await db.query(
      "INSERT INTO generated_resumes (resume_id, template_id, status) VALUES (?, ?, 'completed')",
      [resumeId, templateId]
    );

    return res.json({
      success: true,
      generatedResumeId: result.insertId,
      templateId,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ success: false, error: "Generation failed" });
  }
});

// ==============================
// STEP 5 → GET COMPLETE RESUME DATA
// ==============================
app.get("/api/resume/:resumeId/complete", async (req, res) => {
  try {
    const { resumeId } = req.params;

    // 0️⃣ PROFILE DATA (template + image if you use resume_profiles)
    const [profileRows] = await db.query(
      `SELECT selected_template, profile_image
       FROM resume_profiles
       WHERE id = ?`,
      [resumeId]
    );
    const profile = profileRows.length ? profileRows[0] : null;

    // 1️⃣ STEP 1 DATA (✅ include everything you save in step1 table)
    const [step1Rows] = await db.query(
      `SELECT 
        full_name,
        dob,
        gender,
        phone,
        email,
        linkedin,
        github,
        address,
        about_me,
        career_objective,
        education,
        technical_skills,
        soft_skills,
        languages,
        projects,
        experience,
         ai_career_recommendations,
        course
      FROM resume_step1
      WHERE resume_id = ?`,
      [resumeId]
    );

    const step1 = step1Rows.length ? step1Rows[0] : null;

    // 2️⃣ STEP SCORES (2,3,4)
    const [scoreRows] = await db.query(
      `SELECT step_number, score, contribution
       FROM resume_step_scores
       WHERE resume_id = ?
       AND step_number IN (2,3,4)
       ORDER BY step_number ASC`,
      [resumeId]
    );

    res.json({
      success: true,
      data: {
        profile,          // ✅ {selected_template, profile_image}
        step1,            // ✅ all step1 fields
        contributions: scoreRows
      }
    });
  } catch (err) {
    console.error("STEP 5 FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resume data",
    });
  }
});

app.post("/api/resume/:resumeId/upload-image", upload.single("image"), async (req, res) => {
  try {
    const { resumeId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    await db.query(
      "UPDATE resume_profiles SET profile_image = ? WHERE id = ?",
      [imagePath, resumeId]
    );

    res.json({ success: true, imagePath });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.get("/api/resume/:resumeId/pdf", async (req, res) => {
  res.download("resume.pdf");
});

// ==============================
// STEP 5 → AI GENERATE ABOUT ME
// ==============================
app.post("/api/resume/:resumeId/generate-about", async (req, res) => {
  try {
    const { resumeId } = req.params;

    // fetch step1
    const [rows] = await db.query(
      `SELECT full_name, course, career_objective, technical_skills, soft_skills, languages, projects, experience
       FROM resume_step1
       WHERE resume_id = ?`,
      [resumeId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Resume step1 not found" });
    }

    const step1 = rows[0];

    const prompt = `
Write a professional "About Me" summary (3-4 lines) for an internship resume.
Use ONLY the provided information. Do NOT invent achievements or companies.
Keep it confident, simple, and ATS-friendly.

Name: ${step1.full_name || ""}
Course: ${step1.course || ""}
Career objective: ${step1.career_objective || ""}
Technical skills: ${step1.technical_skills || ""}
Soft skills: ${step1.soft_skills || ""}
Languages: ${step1.languages || ""}
Projects (json/text): ${step1.projects || ""}
Experience (json/text): ${step1.experience || ""}

Return ONLY the paragraph (no heading, no bullet points).
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You write concise resume summaries." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
    });

    const about = completion.choices?.[0]?.message?.content?.trim() || "";

    // save to DB
    await db.query(
      `UPDATE resume_step1 SET about_me = ? WHERE resume_id = ?`,
      [about, resumeId]
    );

    res.json({ success: true, about_me: about });
  } catch (err) {
    console.error("AI ABOUT ME ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to generate About Me" });
  }
});

// AI Career Recommendation
app.post("/api/resume/:resumeId/generate-career", async (req, res) => {
  try {
    const { resumeId } = req.params;

    const [rows] = await db.query(
      `SELECT full_name, course, technical_skills, soft_skills,
              languages, education, projects, experience
       FROM resume_step1
       WHERE resume_id = ?`,
      [resumeId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false });
    }

    const resume = rows[0];

    const prompt = `
You are a career advisor AI.

Based on the following resume data:

Course: ${resume.course}
Technical Skills: ${resume.technical_skills}
Soft Skills: ${resume.soft_skills}
Languages: ${resume.languages}
Projects: ${resume.projects}
Experience: ${resume.experience}

Generate 4 suitable job roles.

For each role provide:
- job_title
- short_reason (2 lines max)
- 3 key skills relevant to that role

Return ONLY JSON in this format:

[
  {
    "title": "",
    "reason": "",
    "skills": []
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

    const parsed = JSON.parse(text);

    await db.query(
      `UPDATE resume_step1
       SET ai_career_recommendations = ?
       WHERE resume_id = ?`,
      [JSON.stringify(parsed), resumeId]
    );

    res.json({
      success: true,
      recommendations: parsed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/students/save-generated-resume", async (req, res) => {
  const { studentId, resumeId } = req.body;

  if (!studentId || !resumeId) {
    return res.status(400).json({ message: "studentId and resumeId required" });
  }

  try {
    await db.query(
      "UPDATE students SET generated_resume_id = ? WHERE id = ?",
      [resumeId, studentId]
    );

    res.json({ message: "Saved generated resume to student" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

//--- Student Job Application
// Student applies to a job
app.post("/api/jobs/:jobId/apply", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Missing studentId" });
    }

    // Find latest resumeId (if exists)
    const [resumeRows] = await db.query(
      "SELECT id FROM resume_profiles WHERE student_id = ? ORDER BY id DESC LIMIT 1",
      [studentId]
    );
    const resumeId = resumeRows.length ? resumeRows[0].id : null;

    await db.query(
      `INSERT INTO job_applications (job_id, student_id, resume_id, status)
       VALUES (?, ?, ?, 'applied')`,
      [jobId, studentId, resumeId]
    );

    res.json({ success: true, message: "Applied successfully" });
  } catch (err) {
    // Duplicate apply
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Already applied" });
    }
    console.error("Apply Job Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get applied jobs for a student
app.get("/api/students/:studentId/applied-jobs", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await db.query(
      `SELECT ja.job_id, ja.status, ja.applied_at
       FROM job_applications ja
       WHERE ja.student_id = ?
       ORDER BY ja.applied_at DESC`,
      [studentId]
    );

    res.json({ success: true, applied: rows });
  } catch (err) {
    console.error("Get Applied Jobs Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get AI career recommendations for a student (from latest resume)
app.get("/api/students/:studentId/ai-recommendations", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [resumeRows] = await db.query(
      "SELECT id FROM resume_profiles WHERE student_id = ? ORDER BY id DESC LIMIT 1",
      [studentId]
    );

    if (!resumeRows.length) {
      return res.json({ success: true, recommendations: [] });
    }

    const resumeId = resumeRows[0].id;

    const [step1Rows] = await db.query(
      "SELECT ai_career_recommendations FROM resume_step1 WHERE resume_id = ? LIMIT 1",
      [resumeId]
    );

    if (!step1Rows.length || !step1Rows[0].ai_career_recommendations) {
      return res.json({ success: true, recommendations: [] });
    }

    const parsed = JSON.parse(step1Rows[0].ai_career_recommendations || "[]");
    res.json({ success: true, recommendations: parsed });
  } catch (err) {
    console.error("AI Recommendations Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/students/:studentId/applied-jobs/details", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        ja.id AS application_id,
        ja.job_id,
        ja.status,
        ja.applied_at,
        j.job_title,
        e.company_name
      FROM job_applications ja
      JOIN jobs j ON j.id = ja.job_id
      JOIN employers e ON e.id = j.employer_id
      WHERE ja.student_id = ?
      ORDER BY ja.applied_at DESC
      `,
      [studentId]
    );

    res.json({ success: true, applied: rows });
  } catch (err) {
    console.error("Applied Jobs Details Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


//--EMPLOYER VIEW APPLICATION(JOBS)
app.get("/api/employers/:id/applications", async (req, res) => {
  try {
    const employerId = req.params.id; // ✅ FIX: define employerId

    const [rows] = await db.query(
      `
      SELECT
        ja.id AS application_id,
        ja.job_id,
        ja.status,
        ja.applied_at,

        j.job_title,

        s.id AS student_id,
        s.name AS student_name,
        s.student_id AS student_student_id,
        s.course,
        s.email AS student_email,
        s.contact_number,

        rp.id AS resume_id,
        rp.resume_pdf_path AS resume_url
      FROM job_applications ja
      JOIN jobs j ON j.id = ja.job_id
      JOIN students s ON s.id = ja.student_id
      LEFT JOIN resume_profiles rp ON rp.id = ja.resume_id
      WHERE j.employer_id = ?
      ORDER BY ja.applied_at DESC
      `,
      [employerId]
    );

    return res.json({ applications: rows });
  } catch (err) {
    console.error("Employer Applications Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/applications/:applicationId/status", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await db.query(
      "UPDATE job_applications SET status = ? WHERE id = ?",
      [status, applicationId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update Application Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/api/resume/:resumeId/upload-pdf",
  uploadResumePdf.single("file"),
  async (req, res) => {
    try {
      const { resumeId } = req.params;
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const pdfPath = `/uploads/resume_pdfs/${req.file.filename}`;

      await db.query(
        "UPDATE resume_profiles SET resume_pdf_path = ? WHERE id = ?",
        [pdfPath, resumeId]
      );

      return res.json({ message: "PDF saved", resume_pdf_path: pdfPath });
    } catch (err) {
      console.error("Upload PDF error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// EMPLOYER REPORT (cards + per-job table)
app.get("/api/employers/:id/report", async (req, res) => {
  try {
    const employerId = req.params.id;

    // 1) Per-job counts
    const [jobRows] = await db.query(
      `
      SELECT
        j.id AS job_id,
        j.job_title,
        SUM(CASE WHEN LOWER(COALESCE(ja.status,'')) IN ('accepted') THEN 1 ELSE 0 END) AS accepted_count,
        SUM(CASE WHEN LOWER(COALESCE(ja.status,'')) IN ('rejected') THEN 1 ELSE 0 END) AS rejected_count,
        SUM(CASE
              WHEN LOWER(COALESCE(ja.status,'')) IN ('applied','pending','') THEN 1
              ELSE 0
            END) AS pending_count,
        COUNT(ja.id) AS applied_count
      FROM jobs j
      LEFT JOIN job_applications ja ON ja.job_id = j.id
      WHERE j.employer_id = ?
      GROUP BY j.id, j.job_title
      ORDER BY j.created_at DESC
      `,
      [employerId]
    );

    // 2) Cards totals from jobRows
    const totals = jobRows.reduce(
      (acc, r) => {
        acc.totalApplied += Number(r.applied_count || 0);
        acc.totalAccepted += Number(r.accepted_count || 0);
        acc.totalRejected += Number(r.rejected_count || 0);
        acc.totalPending += Number(r.pending_count || 0);
        return acc;
      },
      { totalApplied: 0, totalAccepted: 0, totalRejected: 0, totalPending: 0 }
    );

    // 3) Interview scheduled count (if table exists)
    // If you haven’t created the interview table yet, just set this to 0.
    let interviewScheduled = 0;
    try {
      const [intRows] = await db.query(
        `
        SELECT COUNT(*) AS cnt
        FROM employer_interviews
        WHERE employer_id = ?
          AND status = 'scheduled'
        `,
        [employerId]
      );
      interviewScheduled = Number(intRows?.[0]?.cnt || 0);
    } catch (e) {
      interviewScheduled = 0; // table not created yet
    }

    res.json({
      success: true,
      cards: {
        ...totals,
        interviewScheduled,
      },
      table: jobRows,
    });
  } catch (err) {
    console.error("Employer report error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// CREATE interview schedule
app.post("/api/employers/:id/interviews", async (req, res) => {
  try {
    const employerId = req.params.id;
    const {
      job_id,
      student_id,
      application_id,
      interview_datetime,
      mode, // "online" | "face_to_face"
      notes
    } = req.body;

    if (!job_id || !student_id || !application_id || !interview_datetime) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Insert interview (status defaults to scheduled)
    const [result] = await db.query(
      `INSERT INTO employer_interviews
       (employer_id, job_id, student_id, application_id, interview_datetime, mode, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employerId, job_id, student_id, application_id, interview_datetime, mode || "online", notes || null]
    );

    // OPTIONAL: if you want application status to become "interview_scheduled"
    // (You currently only allow accepted/rejected in your update endpoint) :contentReference[oaicite:5]{index=5}
    // await db.query("UPDATE job_applications SET status = 'interview_scheduled' WHERE id = ?", [application_id]);

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Create interview error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE interview status (scheduled/attending/rejected)
app.put("/api/employers/:id/interviews/:interviewId/status", async (req, res) => {
  try {
    const { id: employerId, interviewId } = req.params;
    const { status } = req.body;

    if (!["scheduled", "attending", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    await db.query(
      `UPDATE employer_interviews
       SET status = ?
       WHERE id = ? AND employer_id = ?`,
      [status, interviewId, employerId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update interview status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// SAVE interview outcome + mark interview completed
app.put("/api/employers/:id/interviews/:interviewId/outcome", async (req, res) => {
  try {
    const employerId = req.params.id;
    const interviewId = req.params.interviewId;

    const {
      outcome, // "offered" | "not_offered"
      join_date, // "YYYY-MM-DD" (optional)
      offered_position,
      offered_salary,
      offer_notes,
      rejection_reason,
    } = req.body;

    if (!["offered", "not_offered"].includes(outcome)) {
      return res.status(400).json({ success: false, message: "Invalid outcome" });
    }

    // Ensure interview belongs to employer
    const [check] = await db.query(
      `SELECT id FROM employer_interviews WHERE id = ? AND employer_id = ? LIMIT 1`,
      [interviewId, employerId]
    );

    if (check.length === 0) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    // Validation only for NOT offered
    if (outcome === "not_offered") {
      if (!rejection_reason || String(rejection_reason).trim().length < 3) {
        return res.status(400).json({ success: false, message: "Rejection reason required" });
      }
    }

    await db.query(
      `
      INSERT INTO employer_interview_outcomes
        (interview_id, outcome, join_date, offered_position, offered_salary, offer_notes, rejection_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        outcome = VALUES(outcome),
        join_date = VALUES(join_date),
        offered_position = VALUES(offered_position),
        offered_salary = VALUES(offered_salary),
        offer_notes = VALUES(offer_notes),
        rejection_reason = VALUES(rejection_reason)
      `,
      [
        interviewId,
        outcome,
        outcome === "offered" ? (join_date || null) : null,
        outcome === "offered" ? (offered_position || null) : null,
        outcome === "offered" ? (offered_salary || null) : null,
        outcome === "offered" ? (offer_notes || null) : null,
        outcome === "not_offered" ? rejection_reason : null,
      ]
    );

    // mark interview completed
    await db.query(
      `UPDATE employer_interviews SET status = 'completed' WHERE id = ? AND employer_id = ?`,
      [interviewId, employerId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Save outcome error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/employers/:id/interviews", async (req, res) => {
  try {
    const employerId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT
        ei.id,
        ei.status,
        ei.interview_datetime,
        ei.mode,
        ei.notes,
        j.job_title,
        s.name AS student_name,
        s.student_id AS student_student_id,

        o.outcome,
        o.join_date,
        o.offered_position,
        o.offered_salary,
        o.offer_notes,
        o.rejection_reason

      FROM employer_interviews ei
      JOIN jobs j ON j.id = ei.job_id
      JOIN students s ON s.id = ei.student_id
      LEFT JOIN employer_interview_outcomes o ON o.interview_id = ei.id
      WHERE ei.employer_id = ?
      ORDER BY ei.interview_datetime DESC
      `,
      [employerId]
    );

    res.json({ success: true, interviews: rows });
  } catch (err) {
    console.error("List interviews error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =======================================================
// EMPLOYER REMINDERS
// Table: employer_reminders
// =======================================================

// CREATE reminder
app.post("/api/employers/:id/reminders", async (req, res) => {
  try {
    const employerId = req.params.id;
    const { title, reminder_date, notes } = req.body;

    if (!title || String(title).trim().length < 2) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!reminder_date) {
      return res.status(400).json({ success: false, message: "Reminder date is required" });
    }

    const [result] = await db.query(
      `
      INSERT INTO employer_reminders (employer_id, title, reminder_date, notes)
      VALUES (?, ?, ?, ?)
      `,
      [employerId, String(title).trim(), reminder_date, notes ? String(notes).trim() : null]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Create employer reminder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LIST reminders (optional filters: ?status=all|open|done)
app.get("/api/employers/:id/reminders", async (req, res) => {
  try {
    const employerId = req.params.id;
    const status = String(req.query.status || "open"); // default open

    let where = "WHERE employer_id = ?";
    const params = [employerId];

    if (status === "done") {
      where += " AND is_done = 1";
    } else if (status === "open") {
      where += " AND is_done = 0";
    }

    const [rows] = await db.query(
      `
      SELECT id, employer_id, title, reminder_date, notes, is_done, created_at, updated_at
      FROM employer_reminders
      ${where}
      ORDER BY is_done ASC, reminder_date ASC, id DESC
      `,
      params
    );

    res.json({ success: true, reminders: rows });
  } catch (err) {
    console.error("List employer reminders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE reminder (edit title/date/notes OR mark done)
app.put("/api/employers/:id/reminders/:rid", async (req, res) => {
  try {
    const employerId = req.params.id;
    const rid = req.params.rid;

    const { title, reminder_date, notes, is_done } = req.body;

    // Ensure reminder belongs to employer
    const [check] = await db.query(
      `SELECT id FROM employer_reminders WHERE id = ? AND employer_id = ? LIMIT 1`,
      [rid, employerId]
    );
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    await db.query(
      `
      UPDATE employer_reminders
      SET
        title = COALESCE(?, title),
        reminder_date = COALESCE(?, reminder_date),
        notes = COALESCE(?, notes),
        is_done = COALESCE(?, is_done)
      WHERE id = ? AND employer_id = ?
      `,
      [
        title !== undefined ? String(title).trim() : null,
        reminder_date !== undefined ? reminder_date : null,
        notes !== undefined ? (notes ? String(notes).trim() : null) : null,
        is_done !== undefined ? (is_done ? 1 : 0) : null,
        rid,
        employerId,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update employer reminder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE reminder
app.delete("/api/employers/:id/reminders/:rid", async (req, res) => {
  try {
    const employerId = req.params.id;
    const rid = req.params.rid;

    const [result] = await db.query(
      `DELETE FROM employer_reminders WHERE id = ? AND employer_id = ?`,
      [rid, employerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete employer reminder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// CREATE document
app.post("/api/students/:id/documents", uploadDocs.single("file"), async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File required" });
    }

    const documentName = req.body.document_name || req.file.originalname;

    await db.query(
      `INSERT INTO student_documents (student_id, document_name, file_path, file_type)
       VALUES (?, ?, ?, ?)`,
      [
        studentId,
        documentName,
        `/uploads/documents/${req.file.filename}`,
        req.file.mimetype,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Upload document error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/students/:id/documents", async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1️⃣ Normal uploaded documents
    const [docs] = await db.query(
      `SELECT id, document_name, file_path, file_type, created_at
       FROM student_documents
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
    );

    // 2️⃣ Generated Resume from resume_profile table
    const [resumes] = await db.query(
      `SELECT id,
              resume_pdf_path AS file_path,
              created_at
       FROM resume_profiles
       WHERE student_id = ?
       AND resume_pdf_path IS NOT NULL`,
      [studentId]
    );

    const formattedResumes = resumes.map((r) => ({
      id: `resume-${r.id}`,
      document_name: "Generated Resume",
      file_path: r.file_path,
      file_type: "application/pdf",
      created_at: r.created_at,
    }));

    res.json({
      success: true,
      documents: [...formattedResumes, ...docs],
    });

  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
// GET STUDENT INTERVIEWS
// ==============================
app.get("/api/students/:id/interviews", async (req, res) => {
  try {
    const studentId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT
        ei.id,
        ei.status,
        ei.interview_datetime,
        ei.mode,
        ei.notes,

        j.job_title,
        e.company_name,

        o.outcome,
        o.join_date,
        o.offered_position,
        o.offered_salary,
        o.offer_notes,
        o.rejection_reason

      FROM employer_interviews ei
      JOIN jobs j ON j.id = ei.job_id
      JOIN employers e ON e.id = ei.employer_id
      LEFT JOIN employer_interview_outcomes o ON o.interview_id = ei.id

      WHERE ei.student_id = ?
      ORDER BY ei.interview_datetime DESC
      `,
      [studentId]
    );

    res.json({
      success: true,
      interviews: rows,
    });
  } catch (err) {
    console.error("Fetch student interviews error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
// UPDATE STUDENT INTERVIEW STATUS
// ==============================
app.put(
  "/api/students/:studentId/interviews/:interviewId/status",
  async (req, res) => {
    try {
      const { studentId, interviewId } = req.params;
      const { status } = req.body;

      if (!["attending", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      // Check if interview belongs to student
      const [check] = await db.query(
        `SELECT status FROM employer_interviews
         WHERE id = ? AND student_id = ?`,
        [interviewId, studentId]
      );

      if (check.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      const currentStatus = check[0].status;

      if (currentStatus !== "scheduled") {
        return res.status(400).json({
          success: false,
          message: "You can only respond to scheduled interviews",
        });
      }

      await db.query(
        `UPDATE employer_interviews
         SET status = ?
         WHERE id = ?`,
        [status, interviewId]
      );

      res.json({
        success: true,
        message: "Interview status updated",
      });
    } catch (err) {
      console.error("Update student interview status error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ================================
// STUDENT REMINDERS (GET / POST / DELETE)
// ================================

// Get reminders
app.get("/api/students/:studentId/reminders", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT id, title, reminder_date
       FROM student_reminders
       WHERE student_id = ?
       ORDER BY reminder_date ASC, id DESC`,
      [studentId]
    );

    res.json({ reminders: rows });
  } catch (err) {
    console.error("Get reminders error:", err);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

// Add reminder
app.post("/api/students/:studentId/reminders", async (req, res) => {
  const { studentId } = req.params;
  const { title, reminder_date } = req.body;

  if (!title || String(title).trim().length < 2) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!reminder_date) {
    return res.status(400).json({ message: "Reminder date is required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO student_reminders (student_id, title, reminder_date)
       VALUES (?, ?, ?)`,
      [studentId, String(title).trim(), reminder_date]
    );

    res.json({ id: result.insertId, message: "Reminder added" });
  } catch (err) {
    console.error("Add reminder error:", err);
    res.status(500).json({ message: "Failed to add reminder" });
  }
});

// Delete reminder
app.delete("/api/students/:studentId/reminders/:reminderId", async (req, res) => {
  const { studentId, reminderId } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM student_reminders
       WHERE id = ? AND student_id = ?`,
      [reminderId, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted" });
  } catch (err) {
    console.error("Delete reminder error:", err);
    res.status(500).json({ message: "Failed to delete reminder" });
  }
});

// ================================
// STUDENT DASHBOARD STATS
// ================================
// ================================
// STUDENT DASHBOARD STATS (FIXED)
// ================================
app.get("/api/students/:studentId/dashboard-stats", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [jobsRows] = await db.query(
      `SELECT COUNT(*) AS jobsApplied
       FROM job_applications
       WHERE student_id = ?`,
      [studentId]
    );

    const [resumeRows] = await db.query(
      `SELECT progress
       FROM resume_profiles
       WHERE student_id = ?
       ORDER BY updated_at DESC
       LIMIT 1`,
      [studentId]
    );

    const [interviewRows] = await db.query(
      `SELECT COUNT(*) AS interviewScheduled
       FROM employer_interviews
       WHERE student_id = ?
         AND status IN ('scheduled', 'attending')
         AND interview_datetime >= NOW()`,
      [studentId]
    );

    res.json({
      jobsApplied: jobsRows?.[0]?.jobsApplied || 0,
      assessmentCompleted: resumeRows?.[0]?.progress || 0,
      interviewScheduled: interviewRows?.[0]?.interviewScheduled || 0,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});


// =====================================
// DAILY REPORT APIs
// =====================================

// List daily reports for a student
app.get("/api/students/:id/daily-reports", async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const [rows] = await db.query(
      "SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, created_at DESC",
      [studentId]
    );
    res.json({ success: true, reports: rows });
  } catch (err) {
    console.error("List Daily Reports Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get one daily report by id
app.get("/api/daily-reports/:reportId", async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const [rows] = await db.query("SELECT * FROM daily_reports WHERE id = ?", [reportId]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Report not found" });
    res.json({ success: true, report: rows[0] });
  } catch (err) {
    console.error("Get Daily Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create daily report (supports optional attachment upload)
app.post("/api/students/:id/daily-reports", uploadDocs.single("attachment"), async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { report_date, tasks_done, challenges, learnings, hours_spent } = req.body;

    if (!report_date || !tasks_done) {
      return res.status(400).json({ success: false, message: "report_date and tasks_done are required" });
    }

    const attachment = req.file ? `/uploads/documents/${req.file.filename}` : null;

    // If same day exists (unique), update instead of crashing
    const [existing] = await db.query(
      "SELECT id FROM daily_reports WHERE student_id = ? AND report_date = ?",
      [studentId, report_date]
    );

    if (existing.length) {
      await db.query(
        `UPDATE daily_reports
         SET tasks_done=?, challenges=?, learnings=?, hours_spent=?, attachment=COALESCE(?, attachment)
         WHERE id=?`,
        [
          tasks_done,
          challenges || null,
          learnings || null,
          Number(hours_spent || 0),
          attachment,
          existing[0].id,
        ]
      );
      return res.json({ success: true, message: "Daily report updated (same date)", id: existing[0].id });
    }

    const [result] = await db.query(
      `INSERT INTO daily_reports (student_id, report_date, tasks_done, challenges, learnings, hours_spent, attachment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        report_date,
        tasks_done,
        challenges || null,
        learnings || null,
        Number(hours_spent || 0),
        attachment,
      ]
    );

    res.json({ success: true, message: "Daily report created", id: result.insertId });
  } catch (err) {
    console.error("Create Daily Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update daily report by id
app.put("/api/daily-reports/:reportId", uploadDocs.single("attachment"), async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const { report_date, tasks_done, challenges, learnings, hours_spent } = req.body;

    const attachment = req.file ? `/uploads/documents/${req.file.filename}` : null;

    // Only update fields provided
    const fields = [];
    const values = [];

    if (report_date !== undefined) { fields.push("report_date=?"); values.push(report_date); }
    if (tasks_done !== undefined) { fields.push("tasks_done=?"); values.push(tasks_done); }
    if (challenges !== undefined) { fields.push("challenges=?"); values.push(challenges || null); }
    if (learnings !== undefined) { fields.push("learnings=?"); values.push(learnings || null); }
    if (hours_spent !== undefined) { fields.push("hours_spent=?"); values.push(Number(hours_spent || 0)); }
    if (attachment) { fields.push("attachment=?"); values.push(attachment); }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }

    values.push(reportId);

    const [result] = await db.query(
      `UPDATE daily_reports SET ${fields.join(", ")} WHERE id=?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: "Daily report updated" });
  } catch (err) {
    console.error("Update Daily Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete daily report
app.delete("/api/daily-reports/:reportId", async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const [result] = await db.query("DELETE FROM daily_reports WHERE id=?", [reportId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.json({ success: true, message: "Daily report deleted" });
  } catch (err) {
    console.error("Delete Daily Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// =====================================
// WEEKLY REPORT APIs
// =====================================

// List weekly reports for a student
app.get("/api/students/:id/weekly-reports", async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const [rows] = await db.query(
      "SELECT * FROM weekly_reports WHERE student_id = ? ORDER BY week_start DESC, created_at DESC",
      [studentId]
    );
    res.json({ success: true, reports: rows });
  } catch (err) {
    console.error("List Weekly Reports Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get one weekly report by id
app.get("/api/weekly-reports/:reportId", async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const [rows] = await db.query("SELECT * FROM weekly_reports WHERE id = ?", [reportId]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Report not found" });
    res.json({ success: true, report: rows[0] });
  } catch (err) {
    console.error("Get Weekly Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create weekly report (supports optional attachment upload)
app.post("/api/students/:id/weekly-reports", uploadDocs.single("attachment"), async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { week_start, week_end, summary, achievements, challenges, next_week_plan } = req.body;

    if (!week_start || !week_end || !summary) {
      return res.status(400).json({ success: false, message: "week_start, week_end, and summary are required" });
    }

    const attachment = req.file ? `/uploads/documents/${req.file.filename}` : null;

    // If same week_start exists (unique), update instead
    const [existing] = await db.query(
      "SELECT id FROM weekly_reports WHERE student_id = ? AND week_start = ?",
      [studentId, week_start]
    );

    if (existing.length) {
      await db.query(
        `UPDATE weekly_reports
         SET week_end=?, summary=?, achievements=?, challenges=?, next_week_plan=?, attachment=COALESCE(?, attachment)
         WHERE id=?`,
        [
          week_end,
          summary,
          achievements || null,
          challenges || null,
          next_week_plan || null,
          attachment,
          existing[0].id,
        ]
      );
      return res.json({ success: true, message: "Weekly report updated (same week_start)", id: existing[0].id });
    }

    const [result] = await db.query(
      `INSERT INTO weekly_reports (student_id, week_start, week_end, summary, achievements, challenges, next_week_plan, attachment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        week_start,
        week_end,
        summary,
        achievements || null,
        challenges || null,
        next_week_plan || null,
        attachment,
      ]
    );

    res.json({ success: true, message: "Weekly report created", id: result.insertId });
  } catch (err) {
    console.error("Create Weekly Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update weekly report by id
app.put("/api/weekly-reports/:reportId", uploadDocs.single("attachment"), async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const { week_start, week_end, summary, achievements, challenges, next_week_plan } = req.body;

    const attachment = req.file ? `/uploads/documents/${req.file.filename}` : null;

    const fields = [];
    const values = [];

    if (week_start !== undefined) { fields.push("week_start=?"); values.push(week_start); }
    if (week_end !== undefined) { fields.push("week_end=?"); values.push(week_end); }
    if (summary !== undefined) { fields.push("summary=?"); values.push(summary); }
    if (achievements !== undefined) { fields.push("achievements=?"); values.push(achievements || null); }
    if (challenges !== undefined) { fields.push("challenges=?"); values.push(challenges || null); }
    if (next_week_plan !== undefined) { fields.push("next_week_plan=?"); values.push(next_week_plan || null); }
    if (attachment) { fields.push("attachment=?"); values.push(attachment); }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }

    values.push(reportId);

    const [result] = await db.query(
      `UPDATE weekly_reports SET ${fields.join(", ")} WHERE id=?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: "Weekly report updated" });
  } catch (err) {
    console.error("Update Weekly Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete weekly report
app.delete("/api/weekly-reports/:reportId", async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const [result] = await db.query("DELETE FROM weekly_reports WHERE id=?", [reportId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.json({ success: true, message: "Weekly report deleted" });
  } catch (err) {
    console.error("Delete Weekly Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================================
// ATTENDANCE APIs (Stage 2)
// =====================================

// List attendance records for a student
app.get("/api/students/:id/attendance", async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const [rows] = await db.query(
      "SELECT id, student_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, check_in_time, check_out_time, status, notes, mc_file, created_at, updated_at FROM attendance WHERE student_id=? ORDER BY date DESC",
      [studentId]
    );
    res.json({ success: true, records: rows });
  } catch (err) {
    console.error("List Attendance Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Check-in (creates today's record if not exists)
app.post("/api/students/:id/attendance/check-in", async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const today = malaysiaYMD();
    const now = malaysiaHMS();

    const [existing] = await db.query(
      "SELECT * FROM attendance WHERE student_id=? AND date=?",
      [studentId, today]
    );

    if (existing.length) {
      const row = existing[0];
      if (row.check_in_time) {
        return res.status(400).json({ success: false, message: "Already checked in today." });
      }

      await db.query(
        "UPDATE attendance SET check_in_time=?, status='present' WHERE id=?",
        [now, row.id]
      );

      return res.json({ success: true, message: "Checked in", date: today, check_in_time: now });
    }

    await db.query(
      "INSERT INTO attendance (student_id, date, check_in_time, status) VALUES (?, ?, ?, 'present')",
      [studentId, today, now]
    );

    res.json({ success: true, message: "Checked in", date: today, check_in_time: now });
  } catch (err) {
    console.error("Check-in Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Check-out (must have today's record + check-in)
app.post("/api/students/:id/attendance/check-out", async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const today = malaysiaYMD();
    const now = malaysiaHMS();

    const [rows] = await db.query(
      "SELECT * FROM attendance WHERE student_id=? AND date=?",
      [studentId, today]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, message: "No attendance record for today. Please check in first." });
    }

    const row = rows[0];
    if (!row.check_in_time) {
      return res.status(400).json({ success: false, message: "Please check in first." });
    }

    if (row.check_out_time) {
      return res.status(400).json({ success: false, message: "Already checked out today." });
    }

    await db.query("UPDATE attendance SET check_out_time=? WHERE id=?", [now, row.id]);

    res.json({ success: true, message: "Checked out", date: today, check_out_time: now });
  } catch (err) {
    console.error("Check-out Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark Absent + optional MC upload
app.post("/api/students/:id/attendance/absent", uploadDocs.single("mc_file"), async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { date, notes } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }

    const mcPath = req.file ? `/uploads/documents/${req.file.filename}` : null;

    // upsert
    const [existing] = await db.query(
      "SELECT id FROM attendance WHERE student_id=? AND date=?",
      [studentId, date]
    );

    if (existing.length) {
      await db.query(
        "UPDATE attendance SET status='absent', notes=?, mc_file=? WHERE id=?",
        [notes || null, mcPath, existing[0].id]
      );
      return res.json({ success: true, message: "Marked absent (updated)", id: existing[0].id });
    }

    const [result] = await db.query(
      "INSERT INTO attendance (student_id, date, status, notes, mc_file) VALUES (?, ?, 'absent', ?, ?)",
      [studentId, date, notes || null, mcPath]
    );

    res.json({ success: true, message: "Marked absent", id: result.insertId });
  } catch (err) {
    console.error("Absent Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update attendance (edit notes/status)
app.put("/api/attendance/:attendanceId", uploadDocs.single("mc_file"), async (req, res) => {
  try {
    const attendanceId = Number(req.params.attendanceId);
    const { status, notes, date, check_in_time, check_out_time } = req.body;

    const mcPath = req.file ? `/uploads/documents/${req.file.filename}` : null;

    const fields = [];
    const values = [];

    if (date !== undefined) { fields.push("date=?"); values.push(date); }
    if (check_in_time !== undefined) { fields.push("check_in_time=?"); values.push(check_in_time || null); }
    if (check_out_time !== undefined) { fields.push("check_out_time=?"); values.push(check_out_time || null); }
    if (status !== undefined) { fields.push("status=?"); values.push(status); }
    if (notes !== undefined) { fields.push("notes=?"); values.push(notes || null); }
    if (mcPath) { fields.push("mc_file=?"); values.push(mcPath); }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }

    values.push(attendanceId);

    const [result] = await db.query(
      `UPDATE attendance SET ${fields.join(", ")} WHERE id=?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    res.json({ success: true, message: "Attendance updated" });
  } catch (err) {
    console.error("Update Attendance Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// ADMIN DASHBOARD STATS
// =========================
app.get("/api/admin/dashboard/stats", async (req, res) => {
  try {
    const [[studentsRow]] = await db.query(
      "SELECT COUNT(*) AS total_students FROM students"
    );

    const [[employersRow]] = await db.query(
      "SELECT COUNT(*) AS total_employers FROM employers"
    );

    const [[jobsRow]] = await db.query(
      "SELECT COUNT(*) AS total_jobs FROM jobs"
    );

    const [[appsRow]] = await db.query(
      "SELECT COUNT(*) AS total_applications FROM job_applications"
    );

    // NEW: Resume progress from resume_profiles.progress (0-100)
    const [[resumeAgg]] = await db.query(`
      SELECT 
        COUNT(*) AS started_resume,
        COALESCE(ROUND(AVG(progress)), 0) AS avg_progress
      FROM resume_profiles
    `);

    res.json({
      totalStudents: Number(studentsRow.total_students || 0),
      totalEmployers: Number(employersRow.total_employers || 0),
      totalJobs: Number(jobsRow.total_jobs || 0),
      totalApplications: Number(appsRow.total_applications || 0),

      startedResume: Number(resumeAgg.started_resume || 0),
      assessmentAvgProgress: Number(resumeAgg.avg_progress || 0),
    });
  } catch (err) {
    console.error("Admin Dashboard Stats Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// REAL-TIME (SSE) STREAM
// =========================
app.get("/api/admin/dashboard/stream", async (req, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendStats = async () => {
    try {
      const [[studentsRow]] = await db.query(
        "SELECT COUNT(*) AS total_students FROM students"
      );
      const [[employersRow]] = await db.query(
        "SELECT COUNT(*) AS total_employers FROM employers"
      );
      const [[jobsRow]] = await db.query(
        "SELECT COUNT(*) AS total_jobs FROM jobs"
      );
      const [[appsRow]] = await db.query(
        "SELECT COUNT(*) AS total_applications FROM job_applications"
      );
      const [[completedRow]] = await db.query(
        "SELECT COUNT(*) AS completed_assessment FROM students WHERE generated_resume_id IS NOT NULL"
      );

      const totalStudents = Number(studentsRow.total_students || 0);
      const completed = Number(completedRow.completed_assessment || 0);
      const assessmentCompletedPct =
        totalStudents === 0 ? 0 : Math.round((completed / totalStudents) * 100);

      const payload = {
        totalStudents,
        totalEmployers: Number(employersRow.total_employers || 0),
        totalJobs: Number(jobsRow.total_jobs || 0),
        totalApplications: Number(appsRow.total_applications || 0),
        assessmentCompletedPct,
        serverTime: malaysiaNow().toISOString(),
      };

      res.write(`event: stats\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      console.error("SSE sendStats error:", err);
      // keep connection alive even if one query fails
    }
  };

  // send immediately + every 3 seconds
  await sendStats();
  const timer = setInterval(sendStats, 3000);

  // close cleanup
  req.on("close", () => {
    clearInterval(timer);
    res.end();
  });
});

// =========================
// ADMIN - ALL STUDENT DOCUMENTS
// =========================
app.get("/api/admin/student-documents", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM (
        /* 1) Normal uploaded documents */
        SELECT
          s.id AS student_db_id,
          s.student_id AS student_code,
          s.name AS student_name,
          s.course,
          d.id AS source_id,
          d.document_name,
          'normal_document' AS document_type,
          d.file_path,
          d.file_type,
          d.created_at AS uploaded_at,
          NULL AS extra_info
        FROM students s
        JOIN student_documents d ON d.student_id = s.id

        UNION ALL

        /* 2) Daily reports */
        SELECT
          s.id AS student_db_id,
          s.student_id AS student_code,
          s.name AS student_name,
          s.course,
          dr.id AS source_id,
          CONCAT('Daily Report - ', DATE_FORMAT(dr.report_date, '%Y-%m-%d')) AS document_name,
          'daily_report' AS document_type,
          dr.attachment AS file_path,
          CASE
            WHEN dr.attachment IS NOT NULL THEN 'attachment'
            ELSE 'text'
          END AS file_type,
          dr.created_at AS uploaded_at,
          dr.tasks_done AS extra_info
        FROM students s
        JOIN daily_reports dr ON dr.student_id = s.id

        UNION ALL

        /* 3) Weekly reports */
        SELECT
          s.id AS student_db_id,
          s.student_id AS student_code,
          s.name AS student_name,
          s.course,
          wr.id AS source_id,
          CONCAT(
            'Weekly Report - ',
            DATE_FORMAT(wr.week_start, '%Y-%m-%d'),
            ' to ',
            DATE_FORMAT(wr.week_end, '%Y-%m-%d')
          ) AS document_name,
          'weekly_report' AS document_type,
          wr.attachment AS file_path,
          CASE
            WHEN wr.attachment IS NOT NULL THEN 'attachment'
            ELSE 'text'
          END AS file_type,
          wr.created_at AS uploaded_at,
          wr.summary AS extra_info
        FROM students s
        JOIN weekly_reports wr ON wr.student_id = s.id

        UNION ALL

        /* 4) Generated resume */
        SELECT
          s.id AS student_db_id,
          s.student_id AS student_code,
          s.name AS student_name,
          s.course,
          rp.id AS source_id,
          'Generated Resume' AS document_name,
          'generated_resume' AS document_type,
          rp.resume_pdf_path AS file_path,
          'pdf' AS file_type,
          rp.created_at AS uploaded_at,
          NULL AS extra_info
        FROM students s
        JOIN resume_profiles rp ON rp.student_id = s.id
        WHERE rp.resume_pdf_path IS NOT NULL
      ) docs
      ORDER BY uploaded_at DESC
    `);

    res.json({ success: true, documents: rows });
  } catch (err) {
    console.error("Admin student documents error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

  app.listen(3001, () => console.log("Server running on port 3001"));
}


startServer();
