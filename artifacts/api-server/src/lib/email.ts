import { Resend } from "resend";
import { logger } from "./logger.js";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const OWNER_EMAIL = process.env.OWNER_EMAIL;

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

function buildEmailHtml(data: NewReservationEmailData): string {
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

              <!-- Guest info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#2EC4D6;">Guest</p>
                    <p style="margin:0;font-size:22px;font-weight:600;color:#ffffff;">${data.name}</p>
                    <p style="margin:4px 0 0 0;font-size:15px;color:#999999;">${data.phone}</p>
                  </td>
                </tr>
              </table>

              <!-- Details grid -->
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

              <!-- CTA -->
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

export async function sendNewReservationEmail(
  data: NewReservationEmailData
): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping reservation email");
    return;
  }
  if (!OWNER_EMAIL) {
    logger.warn("OWNER_EMAIL not set — skipping reservation email");
    return;
  }

  const formattedTime = formatTime(data.time);
  const formattedDate = formatDate(data.date);
  const subject = `New Reservation — ${data.name} — ${formattedDate} at ${formattedTime}`;

  const { error } = await resend.emails.send({
    from: "Toma Lounge <onboarding@resend.dev>",
    to: OWNER_EMAIL,
    subject,
    html: buildEmailHtml(data),
  });

  if (error) {
    logger.error({ err: error }, "Failed to send reservation email via Resend");
    throw new Error(error.message);
  }

  logger.info({ to: OWNER_EMAIL, guest: data.name }, "Reservation email sent");
}
