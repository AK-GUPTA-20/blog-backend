const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    await resend.emails.send({
      from:"onboarding@resend.dev", 
      to: options.email,
      subject: options.subject,
      html: options.html || `<p>${options.message}</p>`,
    });

  } catch (error) {
    console.error("Resend Error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;