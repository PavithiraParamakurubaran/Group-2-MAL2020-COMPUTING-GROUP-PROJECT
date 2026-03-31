import nodemailer from "nodemailer";
import path from "path";

// Configure your transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "paviparam26@gmail.com",
    pass: "kozb jjua gfew dktx", // make sure you use App Password
  },
});

/**
 * Send email with optional attachment
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} message - reminder message
 * @param {string} deadline - deadline in ISO string or Date string
 * @param {string|null} attachmentPath - optional attachment path
 */
export async function sendEmail(to, subject, message, deadline, attachmentPath = null) {
  try {
    // Format deadline nicely
    const deadlineFormatted = new Date(deadline).toLocaleString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const mailOptions = {
      from: "paviparam26@gmail.com",
      to,
      subject,
      html: `
        <h2>${subject}</h2>
        <p>${message}</p>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
        ${attachmentPath ? `<p>An attachment is included with this email.</p>` : ""}
      `,
    };

    if (attachmentPath) {
      const absolutePath = path.join(process.cwd(), attachmentPath);
      mailOptions.attachments = [
        {
          filename: path.basename(absolutePath),
          path: absolutePath,
        },
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} ${attachmentPath ? "with attachment" : ""}`);
  } catch (err) {
    console.error("Send Email Error:", err);
    throw err;
  }
}
