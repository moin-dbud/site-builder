import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function testGmail() {
  console.log("Testing Gmail SMTP with user:", process.env.SMTP_USER);
  const rawPass = process.env.SMTP_PASS || '';
  const cleanPass = rawPass.replace(/[\s-]/g, '');

  console.log("Raw pass length:", rawPass.length, "Clean pass length:", cleanPass.length);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: cleanPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Test Email from Buildo AI',
      text: 'This is a test email to verify Gmail SMTP configuration.',
    });
    console.log("SUCCESS! Message ID:", info.messageId);
  } catch (error: any) {
    console.error("GMAIL SMTP ERROR:", error.message || error);
  }
}

testGmail();
