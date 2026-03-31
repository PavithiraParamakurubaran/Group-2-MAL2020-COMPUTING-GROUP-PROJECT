import express from "express";
import { db } from "../config/db";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { role, email, password } = req.body;

  let table = "";

  if (role === "student") table = "students";
  if (role === "admin") table = "admins";
  if (role === "employer") table = "employers";

  if (!table) return res.json({ success: false, message: "Invalid role" });

  const [rows]: any = await db.query(
    `SELECT * FROM ${table} WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) {
    return res.json({ success: false, message: "User not found" });
  }

  const user = rows[0];

  if (user.password !== password) {
    return res.json({ success: false, message: "Wrong password" });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role,
      status: user.status || null
    }
  });
});

export default router;
