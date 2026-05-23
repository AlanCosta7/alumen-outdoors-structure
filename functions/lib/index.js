"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactEmail = exports.generateImageVariants = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const nodemailer = __importStar(require("nodemailer"));
admin.initializeApp();
var imageVariants_1 = require("./imageVariants");
Object.defineProperty(exports, "generateImageVariants", { enumerable: true, get: function () { return imageVariants_1.generateImageVariants; } });
// ── Config ────────────────────────────────────────────────────────────────────
// Set via: firebase functions:config:set email.user="..." email.pass="..."
// Or use Secret Manager (recommended for production).
const getTransporter = () => {
    var _a, _b, _c, _d;
    const cfg = functions.config();
    return nodemailer.createTransport({
        host: (_b = (_a = cfg.email) === null || _a === void 0 ? void 0 : _a.host) !== null && _b !== void 0 ? _b : 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: (_c = cfg.email) === null || _c === void 0 ? void 0 : _c.user,
            pass: (_d = cfg.email) === null || _d === void 0 ? void 0 : _d.pass,
        },
    });
};
const RECIPIENT = 'sales@skywayaluminum.com';
const FROM_NAME = 'Alumen Outdoors Structure';
exports.sendContactEmail = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
    var _a;
    // Rate limiting: require app-check or auth in production
    // context.app is defined when App Check is enabled
    const { name, email, phone, message } = data;
    if (!(name === null || name === void 0 ? void 0 : name.trim()) || !(email === null || email === void 0 ? void 0 : email.trim()) || !(message === null || message === void 0 ? void 0 : message.trim())) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
    }
    const transporter = getTransporter();
    const mailOptions = {
        from: `"${FROM_NAME} Site" <${(_a = functions.config().email) === null || _a === void 0 ? void 0 : _a.user}>`,
        to: RECIPIENT,
        replyTo: `"${name}" <${email}>`,
        subject: `New Contact Form Submission — ${name}`,
        text: [
            `Name:    ${name}`,
            `Email:   ${email}`,
            `Phone:   ${phone !== null && phone !== void 0 ? phone : 'Not provided'}`,
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
    };
    try {
        await transporter.sendMail(mailOptions);
        return { ok: true };
    }
    catch (err) {
        functions.logger.error('sendContactEmail failed', err);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
});
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
//# sourceMappingURL=index.js.map