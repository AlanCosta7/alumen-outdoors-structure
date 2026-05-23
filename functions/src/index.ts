import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'

admin.initializeApp()

export { generateImageVariants } from './imageVariants'

// ── Config ────────────────────────────────────────────────────────────────────
// Set via: firebase functions:config:set email.user="..." email.pass="..."
// Or use Secret Manager (recommended for production).
const getTransporter = () => {
  const cfg = functions.config()
  return nodemailer.createTransport({
    host: cfg.email?.host ?? 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: cfg.email?.user as string,
      pass: cfg.email?.pass as string,
    },
  })
}

const RECIPIENT = 'sales@skywayaluminum.com'
const FROM_NAME = 'Alumen Outdoors Structure'

// ── sendContactEmail ──────────────────────────────────────────────────────────
interface ContactPayload {
  name: string
  email: string
  phone?: string
  message: string
}

export const sendContactEmail = functions
  .region('us-central1')
  .https.onCall(async (data: ContactPayload, context) => {
    // Rate limiting: require app-check or auth in production
    // context.app is defined when App Check is enabled
    const { name, email, phone, message } = data

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields')
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address')
    }

    const transporter = getTransporter()

    const mailOptions = {
      from: `"${FROM_NAME} Site" <${(functions.config().email?.user as string)}>`,
      to: RECIPIENT,
      replyTo: `"${name}" <${email}>`,
      subject: `New Contact Form Submission — ${name}`,
      text: [
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Phone:   ${phone ?? 'Not provided'}`,
        '',
        'Message:',
        message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #353435;">
          <div style="background:#353435; padding:24px 32px;">
            <h2 style="color:#00e676; margin:0; font-size:20px; text-transform:uppercase; letter-spacing:0.05em;">
              New Contact Form Submission
            </h2>
          </div>
          <div style="padding:32px; border:1px solid #e5e5e5; border-top:none;">
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0; font-weight:bold; width:80px; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Name</td>
                <td style="padding:8px 0; font-size:15px;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:bold; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Email</td>
                <td style="padding:8px 0; font-size:15px;">
                  <a href="mailto:${escapeHtml(email)}" style="color:#353435;">${escapeHtml(email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:bold; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Phone</td>
                <td style="padding:8px 0; font-size:15px;">${phone ? escapeHtml(phone) : '<span style="color:#aaa">Not provided</span>'}</td>
              </tr>
            </table>
            <hr style="border:none; border-top:1px solid #e5e5e5; margin:24px 0;" />
            <p style="font-size:12px; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin:0 0 12px;">Message</p>
            <p style="font-size:15px; line-height:1.7; white-space:pre-wrap; margin:0;">${escapeHtml(message)}</p>
          </div>
          <div style="padding:16px 32px; background:#f5f5f5; font-size:11px; color:#aaa;">
            Sent from alumenoutdoors.com contact form
          </div>
        </div>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      return { ok: true }
    } catch (err) {
      functions.logger.error('sendContactEmail failed', err)
      throw new functions.https.HttpsError('internal', 'Failed to send email')
    }
  })

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
