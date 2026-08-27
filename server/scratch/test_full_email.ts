import 'dotenv/config';
import { verifySMTPConnection, sendVerificationOtpEmail } from '../lib/mailer.js';

async function testFullFlow() {
  console.log('--- Verifying SMTP Connection ---');
  const isOk = await verifySMTPConnection();
  console.log('SMTP Verification result:', isOk);

  if (isOk) {
    console.log('--- Attempting to send test OTP email ---');
    const result = await sendVerificationOtpEmail('moinsheikh1303@gmail.com', '123456', 'Test User');
    console.log('Email Send Result:', result);
  }
}

testFullFlow();
