const nodemailer = require("nodemailer");
const { Resend } = require("resend");

require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Nodemailer (Gmail)
const sendMailWithNodemailer = async (options) => {
  try {
    let to, subject, html, text;
    if (typeof options === "object") {
      to = options.email || options.to;
      subject = options.subject;
      html = options.html;
      text = options.message || options.text;
    } else {
      to = options;
      subject = arguments[1];
      html = arguments[2];
    }
    
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
      text,
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
    let email, emailSubject, emailHtml, emailText;

    if (typeof toOrObject === "object") {
      email = toOrObject.email || toOrObject.to;
      emailSubject = toOrObject.subject;
      emailHtml = toOrObject.html;
      emailText = toOrObject.message || toOrObject.text;
    } else {
      email = toOrObject;
      emailSubject = subject;
      emailHtml = html;
    }

    if (!email || !emailSubject || (!emailHtml && !emailText)) {
      throw new Error("Missing fields");
    }

    const response = await resend.emails.send({
      from: "Apiv1 <no-reply@mail.apiv1.tech>", // your verified domain
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
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