const Mailjet = require('node-mailjet');
const env = require('../config/env');

let mailjetClient = null;

function getMailjetClient() {
  if (mailjetClient) return mailjetClient;
  if (!env.mailjetPublicKey || !env.mailjetPrivateKey) {
    throw new Error('Mailjet API keys are not configured. Set MJ_APIKEY_PUBLIC and MJ_APIKEY_PRIVATE.');
  }
  mailjetClient = new Mailjet({
    apiKey: env.mailjetPublicKey,
    apiSecret: env.mailjetPrivateKey,
  });
  return mailjetClient;
}

function buildMessage(toEmail, subject, htmlPart, textPart) {
  return {
    Messages: [
      {
        From: {
          Email: env.mailFromEmail,
          Name: env.mailFromName,
        },
        To: [{ Email: toEmail }],
        Subject: subject,
        TextPart: textPart || '',
        HTMLPart: htmlPart || '',
      },
    ],
  };
}

async function sendEmail(toEmail, subject, html, text) {
  const client = getMailjetClient();
  const payload = buildMessage(toEmail, subject, html, text);
  await client.post('send', { version: 'v3.1' }).request(payload);
}

async function sendPasswordResetEmail(toEmail, resetLink, tenantName) {
  const subject = `Reset your password${tenantName ? ' - ' + tenantName : ''}`;
  const html = `
    <p>Hello,</p>
    <p>We received a request to reset your password${tenantName ? ' for <strong>' + tenantName + '</strong>' : ''}.</p>
    <p>Please click the link below to reset your password:</p>
    <p><a href="${resetLink}" target="_blank" rel="noopener">Reset Password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;
  const text = `Reset your password using this link: ${resetLink}`;
  await sendEmail(toEmail, subject, html, text);
}

async function sendInviteEmail(toEmail, inviteLink, tenantName) {
  const subject = `You're invited to join${tenantName ? ' ' + tenantName : ''}`;
  const html = `
    <p>Hello,</p>
    <p>You have been invited to join${tenantName ? ' <strong>' + tenantName + '</strong>' : ''}.</p>
    <p>Click below to accept the invitation and set up your account:</p>
    <p><a href="${inviteLink}" target="_blank" rel="noopener">Accept Invitation</a></p>
  `;
  const text = `You are invited. Accept here: ${inviteLink}`;
  await sendEmail(toEmail, subject, html, text);
}

async function sendApprovalEmail(toEmail, tenantName, loginLink) {
  const subject = `Your account has been approved${tenantName ? ' - ' + tenantName : ''}`;
  const html = `
    <p>Hello,</p>
    <p>Your account${tenantName ? ' for <strong>' + tenantName + '</strong>' : ''} has been approved.</p>
    ${loginLink ? `<p>You can login here: <a href="${loginLink}" target="_blank" rel="noopener">Login</a></p>` : ''}
  `;
  const text = `Your account has been approved.${loginLink ? ' Login: ' + loginLink : ''}`;
  await sendEmail(toEmail, subject, html, text);
}

async function sendGenericEmail(toEmail, subject, html, text) {
  await sendEmail(toEmail, subject, html, text);
}

module.exports = {
  sendPasswordResetEmail,
  sendInviteEmail,
  sendApprovalEmail,
  sendGenericEmail,
};
