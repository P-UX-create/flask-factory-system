function loginTemplate({ loginTime, device, location, ipAddress }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Login Detected</title>
  </head>

  <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:40px 20px;">

          <table
            width="600"
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
                  New Login Detected
                </h1>

                <p
                  style="
                    margin:0 0 16px;
                    font-size:16px;
                    line-height:1.7;
                    color:#cbd5e1;
                  "
                >
                  We noticed a successful login to your Stockly account.
                </p>

                <p
                  style="
                    margin:0 0 24px;
                    font-size:16px;
                    line-height:1.7;
                    color:#cbd5e1;
                  "
                >
                  If this was you, no action is required. The details of the login are shown below.
                </p>

                <!-- Login Details -->
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  style="
                    background:#1e293b;
                    border:1px solid #334155;
                    border-radius:8px;
                  "
                >

                  <tr>
                    <td style="padding:8px 16px;font-size:14px;color:#94a3b8;">
                      Time
                    </td>
                    <td style="padding:8px 16px;font-size:14px;color:#f8fafc;text-align:right;">
                      ${loginTime}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 16px;font-size:14px;color:#94a3b8;">
                      Device
                    </td>
                    <td style="padding:8px 16px;font-size:14px;color:#f8fafc;text-align:right;">
                      ${device}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 16px;font-size:14px;color:#94a3b8;">
                      Location
                    </td>
                    <td style="padding:8px 16px;font-size:14px;color:#f8fafc;text-align:right;">
                      ${location}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 16px;font-size:14px;color:#94a3b8;">
                      IP Address
                    </td>
                    <td style="padding:8px 16px;font-size:14px;color:#f8fafc;text-align:right;">
                      ${ipAddress}
                    </td>
                  </tr>

                </table>

                <!-- Warning -->
                <div
                  style="
                    margin-top:24px;
                    padding:14px 16px;
                    background:#422006;
                    border-radius:8px;
                    color:#fcd34d;
                    font-size:14px;
                    line-height:1.6;
                  "
                >
                  If you do not recognize this login, change your password immediately and review your account activity.
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding:20px;
                  text-align:center;
                  font-size:12px;
                  color:#64748b;
                "
              >
                This is an automated security notification from Stockly.
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

module.exports = loginTemplate;
