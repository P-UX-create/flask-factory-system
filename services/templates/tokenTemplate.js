function generateTokenEmail(link) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>

  <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:40px 20px;">

          <table
            role="presentation"
            width="600"
            cellspacing="0"
            cellpadding="0"
            style="
              max-width:600px;
              background:#111827;
              border-radius:12px;
              overflow:hidden;
              box-shadow:0 4px 20px rgba(0,0,0,0.3);
            "
          >

            <!-- Header -->
            <tr>
              <td style="padding:24px 32px 0;text-align:right;">
                <span
                  style="
                    color:#f8fafc;
                    font-size:22px;
                    font-weight:bold;
                    letter-spacing:0.5px;
                  "
                >
                  Stockly
                </span>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:24px 32px 40px;">

                <h1
                  style="
                    margin:0 0 20px;
                    font-size:24px;
                    color:#f8fafc;
                  "
                >
                  Reset Your Password
                </h1>

                <p style="margin:0 0 16px;font-size:16px;color:#cbd5e1;">
                  Hello,
                </p>

                <p style="margin:0 0 24px;font-size:16px;color:#cbd5e1;line-height:1.6;">
                  We received a request to reset your password. Click the button below to create a new password.
                </p>

                <!-- Button -->
                <div style="text-align:center;margin:32px 0;">
                  <a
                    href="${link}"
                    style="
                      display:inline-block;
                      padding:14px 28px;
                      background:#2563eb;
                      color:#ffffff;
                      text-decoration:none;
                      font-size:16px;
                      font-weight:600;
                      border-radius:8px;
                    "
                  >
                    Reset Password
                  </a>
                </div>

                <p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>

                <p style="margin:12px 0 0;font-size:14px;word-break:break-all;">
                  <a href="${link}" style="color:#60a5fa;text-decoration:none;">
                    ${link}
                  </a>
                </p>

                <!-- Expiry Notice -->
                <div
                  style="
                    margin-top:24px;
                    padding:12px 16px;
                    background:#422006;
                    color:#fcd34d;
                    border-radius:8px;
                    font-size:14px;
                    line-height:1.6;
                  "
                >
                  This password reset link expires in 5 minutes.
                </div>

                <p
                  style="
                    margin:24px 0 0;
                    font-size:14px;
                    color:#94a3b8;
                    line-height:1.6;
                  "
                >
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding:20px 32px;
                  text-align:center;
                  font-size:12px;
                  color:#64748b;
                  border-top:1px solid #1e293b;
                "
              >
                © Stockly. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

module.exports = generateTokenEmail;
