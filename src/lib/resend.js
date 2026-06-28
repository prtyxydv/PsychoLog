import nodemailer from "nodemailer";

/**
 * PsychoLog Email Sender
 * Uses Nodemailer for universal SMTP support (Business Emails, Gmail, Outlook, etc.)
 */

// If using a standard email provider like Gmail/Google Workspace, 
// you can often just provide the host: smtp.gmail.com, port: 465, secure: true.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE !== "false", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export async function sendPatientInvite({ toEmail, patientAlias, inviteLink, therapistName, expiresAt }) {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  if (!user || !pass) {
    console.warn("SMTP_USER or SMTP_PASS not set. Simulating email send:");
    console.log(`[SIMULATED EMAIL TO ${toEmail}] Link: ${inviteLink}`);
    return { data: { id: "simulated" }, error: null };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
      <h2 style="color: #0d9488; margin-bottom: 24px;">Your PsychoLog Check-in Link</h2>
      
      <p>Hello,</p>
      
      <p>Your therapist, <strong>${therapistName}</strong>, has invited you to use PsychoLog for secure between-session check-ins.</p>
      
      <p>Your private clinical alias is: <strong>${patientAlias}</strong></p>
      
      <div style="margin: 32px 0; text-align: center;">
        <a href="${inviteLink}" 
           style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Set up your secure PIN
        </a>
      </div>
      
      <p style="font-size: 0.9em; color: #57534e;">
        This link is for your use only and will expire on ${new Date(expiresAt).toLocaleDateString("en-US")}.<br/>
        PsychoLog uses end-to-end encryption. Your therapist will only see summarized factual trends, not your raw journal entries.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"PsychoLog" <${fromEmail}>`,
      to: toEmail,
      subject: `Secure Invitation from ${therapistName} (PsychoLog)`,
      html,
    });
    return { data: { id: info.messageId }, error: null };
  } catch (err) {
    console.error("[Nodemailer Error]", err);
    return { data: null, error: err };
  }
}

export async function sendCrisisAlert({ toEmail, therapistName, patientAlias, severity, patientLink }) {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  if (!user || !pass) {
    console.warn("SMTP_USER or SMTP_PASS not set. Simulating crisis email send:");
    return { data: { id: "simulated" }, error: null };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
      <h2 style="color: #ef4444; margin-bottom: 24px;">⚠️ Crisis Alert: ${patientAlias}</h2>
      
      <p>Hello ${therapistName},</p>
      
      <p>PsychoLog has detected potential crisis language in a live session from <strong>${patientAlias}</strong>.</p>
      <p>Severity rating: <strong>${severity.toUpperCase()}</strong></p>
      
      <div style="margin: 32px 0; text-align: center;">
        <a href="${patientLink}" 
           style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View Patient Profile
        </a>
      </div>
      
      <p style="font-size: 0.9em; color: #57534e;">
        Please review the patient's most recent log and follow your standard clinical crisis protocols.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"PsychoLog Crisis Alert" <${fromEmail}>`,
      to: toEmail,
      subject: `URGENT: Crisis Alert for ${patientAlias}`,
      html,
    });
    return { data: { id: info.messageId }, error: null };
  } catch (err) {
    console.error("[Nodemailer Crisis Error]", err);
    return { data: null, error: err };
  }
}

/**
 * Sends a 24-hour appointment reminder email to the patient.
 */
export async function sendAppointmentReminder({
  toEmail,
  patientAlias,
  therapistName,
  appointmentDate,   // JS Date object or ISO string
  logLink,           // patient's check-in link
}) {
  const user      = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass      = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  if (!user || !pass) {
    console.warn("[sendAppointmentReminder] SMTP not configured — simulating.");
    return { data: { id: "simulated" }, error: null };
  }

  const dateStr = new Date(appointmentDate).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
      <h2 style="color: #0d9488; margin-bottom: 24px;">📅 Appointment Reminder</h2>

      <p>Hello,</p>

      <p>This is a reminder from <strong>${therapistName}</strong> that your next therapy session is scheduled for:</p>

      <div style="margin: 24px 0; padding: 16px 20px; background: #f0fdf9; border-left: 4px solid #0d9488; border-radius: 4px;">
        <p style="font-size: 1.1rem; font-weight: bold; margin: 0; color: #0d9488;">${dateStr}</p>
      </div>

      <p>If you'd like to check in before your session, you can use your secure PsychoLog link:</p>

      <div style="margin: 24px 0; text-align: center;">
        <a href="${logLink}"
           style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Submit a Check-in
        </a>
      </div>

      <p style="font-size: 0.9em; color: #57534e;">
        If you have any questions or need to reschedule, please contact your therapist directly.<br/>
        This reminder was sent automatically by PsychoLog on behalf of ${therapistName}.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${therapistName} via PsychoLog" <${fromEmail}>`,
      to: toEmail,
      subject: `Reminder: Your session is tomorrow — ${dateStr}`,
      html,
    });
    return { data: { id: info.messageId }, error: null };
  } catch (err) {
    console.error("[sendAppointmentReminder Error]", err);
    return { data: null, error: err };
  }
}

