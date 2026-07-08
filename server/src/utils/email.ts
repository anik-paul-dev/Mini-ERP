import nodemailer from 'nodemailer';

type PasswordResetEmailData = {
  to: string;
  name: string;
  resetToken: string;
};

const getEnvValue = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value.trim();
  }
  return '';
};

const getRequiredEnv = (...keys: string[]) => {
  const value = getEnvValue(...keys);
  if (!value) {
    throw new Error(`${keys.join(' or ')} is required to send email`);
  }
  return value;
};

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const createTransporter = () => {
  const host = getEnvValue('SMTP_HOST', 'MAIL_HOST') || 'smtp.gmail.com';
  const port = Number(getEnvValue('SMTP_PORT', 'MAIL_PORT') || 465);
  const user = getRequiredEnv('SMTP_USER', 'MAIL_USER', 'GMAIL_USER');
  const pass = getRequiredEnv('SMTP_APP_PASSWORD', 'MAIL_PASSWORD', 'GMAIL_APP_PASSWORD').replace(/\s/g, '');

  return nodemailer.createTransport({
    service: host === 'smtp.gmail.com' ? 'gmail' : undefined,
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetToken }: PasswordResetEmailData) => {
  const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;
  const smtpUser = getRequiredEnv('SMTP_USER', 'MAIL_USER', 'GMAIL_USER');
  const from = getEnvValue('MAIL_FROM', 'SMTP_FROM') || `"Mini ERP" <${smtpUser}>`;

  await createTransporter().sendMail({
    from,
    to,
    subject: 'Reset your Mini ERP password',
    text: [
      `Hello ${name},`,
      '',
      'We received a request to reset your Mini ERP password.',
      `Open this link to set a new password: ${resetUrl}`,
      '',
      'This link will expire in 10 minutes. If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">Reset your password</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your Mini ERP password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};
