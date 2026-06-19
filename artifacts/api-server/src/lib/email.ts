import { Resend } from "resend";
import { logger } from "./logger.js";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const OWNER_EMAIL = process.env.OWNER_EMAIL;

// ── Shared helpers ────────────────────────────────────────────────────────────

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ── Owner notification email ──────────────────────────────────────────────────

export interface NewReservationEmailData {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  notes: string | null;
  status: string;
}

function buildOwnerEmailHtml(data: NewReservationEmailData): string {
  const adminUrl = process.env.ADMIN_DASHBOARD_URL ?? "https://your-app.replit.app/admin";
  const formattedDate = formatDate(data.date);
  const formattedTime = formatTime(data.time);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Reservation</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f2a2e 0%,#1a1a1a 100%);padding:36px 40px;border-bottom:2px solid #2EC4D6;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#2EC4D6;">Toma Lounge</p>
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;">New Reservation</h1>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background-color:#C9A24B;color:#0d0d0d;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;">Pending</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#2EC4D6;">Guest</p>
                    <p style="margin:0;font-size:22px;font-weight:600;color:#ffffff;">${data.name}</p>
                    <p style="margin:4px 0 0 0;font-size:15px;color:#999999;">${data.phone}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#222222;border-radius:8px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2a2a2a;width:50%;">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Date</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${formattedDate}</p>
                  </td>
                  <td style="padding:20px 24px;border-bottom:1px solid #2a2a2a;border-left:1px solid #2a2a2a;">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Time</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${formattedTime}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;" colspan="2">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Party Size</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${data.partySize} ${data.partySize === 1 ? "guest" : "guests"}</p>
                  </td>
                </tr>
                ${data.notes ? `
                <tr>
                  <td style="padding:0 24px 20px 24px;border-top:1px solid #2a2a2a;" colspan="2">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Notes / Occasion</p>
                    <p style="margin:0;font-size:15px;color:#cccccc;">${data.notes}</p>
                  </td>
                </tr>` : ""}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display:inline-block;background-color:#2EC4D6;color:#0d0d0d;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:6px;">View in Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="margin:0;font-size:12px;color:#555555;">Toma Lounge · Barsha Heights · 058 109 5540</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendNewReservationEmail(data: NewReservationEmailData): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping owner notification email");
    return;
  }
  if (!OWNER_EMAIL) {
    logger.warn("OWNER_EMAIL not set — skipping owner notification email");
    return;
  }

  const formattedTime = formatTime(data.time);
  const formattedDate = formatDate(data.date);
  const subject = `New Reservation — ${data.name} — ${formattedDate} at ${formattedTime}`;

  const { error } = await resend.emails.send({
    from: "Toma Lounge <onboarding@resend.dev>",
    to: OWNER_EMAIL,
    subject,
    html: buildOwnerEmailHtml(data),
  });

  if (error) {
    logger.error({ err: error }, "Failed to send owner notification email");
    throw new Error(error.message);
  }

  logger.info({ to: OWNER_EMAIL, guest: data.name }, "Owner notification email sent");
}

// ── Guest confirmation email (sent only when admin marks as confirmed) ─────────

export interface ReservationConfirmedEmailData {
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  notes: string | null;
  guestEmail: string;
}

const MAPS_URL =
  "https://maps.google.com/?q=Cayan+Business+Center+Barsha+Heights+Tecom+Dubai+UAE";

function buildConfirmedEmailHtml(data: ReservationConfirmedEmailData): string {
  const formattedDate = formatDate(data.date);
  const formattedTime = formatTime(data.time);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reservation Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f2a2e 0%,#1a1a1a 100%);padding:40px 40px 32px;border-bottom:2px solid #2EC4D6;text-align:center;">
              <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#2EC4D6;">Toma Lounge</p>
              <!-- Checkmark icon -->
              <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background-color:#2EC4D61a;border:2px solid #2EC4D6;line-height:56px;text-align:center;margin-bottom:16px;">
                <span style="font-size:26px;color:#2EC4D6;">✓</span>
              </div>
              <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#ffffff;">Reservation Confirmed</h1>
              <p style="margin:0;font-size:15px;color:#999999;">Your table is ready. We look forward to welcoming you.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 24px 0;font-size:16px;color:#cccccc;">
                Hello <strong style="color:#ffffff;">${data.name}</strong>,<br/>
                your reservation at <strong style="color:#2EC4D6;">Toma Lounge</strong> has been confirmed.
              </p>

              <!-- Reservation details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#222222;border-radius:8px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td colspan="2" style="padding:14px 24px 10px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#2EC4D6;">Reservation Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #2a2a2a;width:50%;">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Date</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${formattedDate}</p>
                  </td>
                  <td style="padding:16px 24px;border-bottom:1px solid #2a2a2a;border-left:1px solid #2a2a2a;">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Time</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${formattedTime}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;" colspan="2">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Guests</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${data.partySize} ${data.partySize === 1 ? "guest" : "guests"}</p>
                  </td>
                </tr>
                ${data.notes ? `
                <tr>
                  <td style="padding:0 24px 16px;border-top:1px solid #2a2a2a;" colspan="2">
                    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;">Notes</p>
                    <p style="margin:0;font-size:14px;color:#cccccc;">${data.notes}</p>
                  </td>
                </tr>` : ""}
              </table>

              <!-- Location -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1e1e;border:1px solid #2a2a2a;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A24B;">Location</p>
                    <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#ffffff;">Cayan Business Center</p>
                    <p style="margin:0 0 2px 0;font-size:14px;color:#999999;">Barsha Heights (Tecom), Dubai, UAE</p>
                    <p style="margin:8px 0 0 0;font-size:14px;color:#999999;">📞 +971 58 109 5540</p>
                  </td>
                </tr>
              </table>

              <!-- CTA buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${MAPS_URL}" style="display:inline-block;background-color:#C9A24B;color:#0d0d0d;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:6px;">View Location on Maps</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:13px;color:#555555;">Need to change your booking? Call us at <strong style="color:#888888;">+971 58 109 5540</strong></p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="margin:0;font-size:12px;color:#555555;">Toma Lounge · Cayan Business Center, Barsha Heights · 058 109 5540</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendReservationConfirmedEmail(
  data: ReservationConfirmedEmailData
): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping confirmed email");
    return;
  }

  const { error } = await resend.emails.send({
    from: "Toma Lounge <onboarding@resend.dev>",
    to: data.guestEmail,
    subject: "Reservation Confirmed — Toma Lounge",
    html: buildConfirmedEmailHtml(data),
  });

  if (error) {
    logger.error({ err: error }, "Failed to send confirmed email to guest");
    throw new Error(error.message);
  }

  logger.info({ to: data.guestEmail, guest: data.name }, "Reservation confirmed email sent to guest");
}
