import dotenv from 'dotenv';
dotenv.config();
import { sendVerificationOtpEmail } from '../lib/mailer.js';

async function testOtpEmail() {
  console.log("Sending OTP email to buildo.ai.work@gmail.com...");
  const result = await sendVerificationOtpEmail('buildo.ai.work@gmail.com', '654321', 'Test Creator');
  console.log("RESULT:", result);
}

testOtpEmail();
