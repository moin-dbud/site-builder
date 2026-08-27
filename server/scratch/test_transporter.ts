import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const user = process.env.GMAIL_USER || process.env.SMTP_USER;
const pass = (process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || '').replace(/[\s-]/g, '');

async function test() {
  console.log('Testing IPv4 family: 4 on port 587...');
  const t1 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    auth: { user, pass },
    connectionTimeout: 10000,
  } as any);
  try {
    await t1.verify();
    console.log('Port 587 OK');
  } catch (e: any) {
    console.log('Port 587 Fail:', e.message);
  }

  console.log('Testing IPv4 family: 4 with service: gmail (port 465)...');
  const t2 = nodemailer.createTransport({
    service: 'gmail',
    family: 4,
    auth: { user, pass },
    connectionTimeout: 10000,
  } as any);
  try {
    await t2.verify();
    console.log('Service gmail (Port 465) OK');
  } catch (e: any) {
    console.log('Service gmail Fail:', e.message);
  }
}

test();
