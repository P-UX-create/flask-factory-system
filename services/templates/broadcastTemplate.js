function announcementTemplate({ title, body }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
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

            <!-- Title + Body -->
            <tr>
              <td style="padding:24px 32px 40px;">

                <h1
                  style="
                    margin:0 0 20px;
                    font-size:24px;
                    color:#f8fafc;
                  "
                >
                  ${title}
                </h1>

                <div
                  style="
                    font-size:16px;
                    line-height:1.8;
                    color:#cbd5e1;
                    white-space:pre-wrap;
                    word-break:break-word;
                  "
                >
                  ${body}
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
                Thank you for being part of Stockly.
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

module.exports = announcementTemplate;
