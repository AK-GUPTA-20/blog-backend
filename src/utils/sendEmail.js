const nodemailer = require("nodemailer");
const { Resend } = require("resend");

require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Nodemailer (Gmail)
const sendMailWithNodemailer = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { 
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });

    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Resend (your domain)
const sendMailWithResend = async (toOrObject, subject, html) => {
  try {
    let email, emailSubject, emailHtml;

    if (typeof toOrObject === "object") {
      email = toOrObject.email;
      emailSubject = toOrObject.subject;
      emailHtml = toOrObject.html;
    } else {
      email = toOrObject;
      emailSubject = subject;
      emailHtml = html;
    }

    if (!email || !emailSubject || !emailHtml) {
      throw new Error("Missing fields");
    }

    const response = await resend.emails.send({
      from: "Apiv1 <no-reply@mail.apiv1.tech>", // your verified domain
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });

    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// choose service
const sendEmail =
  process.env.EMAIL_SERVICE === "nodemailer"
    ? sendMailWithNodemailer
    : sendMailWithResend;

module.exports = sendEmail;