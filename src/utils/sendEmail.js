const nodemailer = require("nodemailer");
const { Resend } = require("resend");

require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMailWithNodemailer = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

const sendMailWithResend = async (to, subject, text) => {
  try {
    const response = await resend.emails.send({
      from: "[onboarding@resend.dev](mailto:onboarding@resend.dev)",
      to: to,
      subject: subject,
      text: text,
    });
    console.log("Email sent:", response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

module.exports = sendMailWithNodemailer;
module.exports = sendMailWithResend;