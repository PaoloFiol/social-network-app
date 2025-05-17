const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Social Network App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
