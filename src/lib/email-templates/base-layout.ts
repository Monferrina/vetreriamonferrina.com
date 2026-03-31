const PRIMARY = '#1b4965';
const PRIMARY_LIGHT = '#2a6f97';
const SECONDARY = '#b56c33';
const NEUTRAL_100 = '#f5f5f5';
const NEUTRAL_500 = '#737373';

export function baseLayout(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${NEUTRAL_100};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#262626;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${NEUTRAL_100};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${PRIMARY};padding:24px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                Vetreria Monferrina
              </h1>
              <p style="margin:4px 0 0;font-size:13px;color:${PRIMARY_LIGHT};opacity:0.8;">
                Artigiani del vetro dal 1980
              </p>
            </td>
          </tr>

          <!-- Title bar -->
          <tr>
            <td style="background-color:${SECONDARY};padding:12px 32px;text-align:center;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">
                ${title}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${NEUTRAL_100};padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:${NEUTRAL_500};">
                Vetreria Monferrina di Fioravanti Giuseppe
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:${NEUTRAL_500};">
                SS 31, 98/C &mdash; 15033 Casale Monferrato (AL)
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:${NEUTRAL_500};">
                Tel. 0142 563728 &mdash; vetreriamonferrina@gmail.com
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#a3a3a3;">
                Email generata automaticamente dal sito
                <a href="https://vetreriamonferrina.com" style="color:${PRIMARY_LIGHT};text-decoration:none;">vetreriamonferrina.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
