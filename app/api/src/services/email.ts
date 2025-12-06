import { Resend } from 'resend';
import { RESEND_API_KEY, EMAIL_FROM } from '../config/env';

// Only initialize Resend if the API Key is present to prevent startup crashes
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  // If no client or key, fallback to logging (Dev mode)
  if (!resend || !RESEND_API_KEY) {
    console.log(`\n[Email Mock] ------------------------------------------------`);
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your Catly Password`);
    console.log(`Token: ${token}`);
    console.log(`-------------------------------------------------------------\n`);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: 'Reset your Catly Password',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1 style="color: #F5A9C8;">Catly Security</h1>
          <p>You requested a password reset. Use the code below to reset your password:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
            ${token}
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log('[Email] Sent password reset:', data);
  } catch (error) {
    console.error('[Email] Failed to send:', error);
  }
};