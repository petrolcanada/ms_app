const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'FundLens <noreply@fundlens.app>';

const sendEmail = async ({ to, subject, html }) => {
  if (!RESEND_API_KEY) {
    console.log(`[Email] Skipped (no API key): "${subject}" -> ${to}`);
    return null;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, body);
    return null;
  }

  const data = await res.json();
  console.log(`[Email] Sent "${subject}" to ${to}, id=${data.id}`);
  return data;
};

const sendWelcome = (email, name) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to FundLens',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <span style="color: #10B981; font-size: 28px;">&#9670;</span>
          <span style="font-size: 22px; font-weight: 700; color: #1a1a1a; margin-left: 8px;">FundLens</span>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px;">
            Welcome${name ? `, ${name}` : ''}!
          </h1>
          <p style="font-size: 15px; line-height: 1.7; color: #555; margin-bottom: 20px;">
            Your FundLens account is ready. Start exploring thousands of mutual funds and ETFs
            with powerful screening, comparison, and analytics tools.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard"
               style="background: #10B981; color: #fff; padding: 12px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p style="font-size: 14px; color: #888; line-height: 1.6;">
            Your free plan includes the fund explorer, limited screener access, and a 5-slot watchlist.
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing" style="color: #10B981; text-decoration: none;">
              Upgrade to Pro
            </a> for unlimited access.
          </p>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px;
                    font-size: 12px; color: #aaa; text-align: center;">
          &copy; 2026 FundLens. All rights reserved.
        </div>
      </div>
    `,
  });
};

const sendSubscriptionConfirm = (email, name) => {
  return sendEmail({
    to: email,
    subject: 'FundLens Pro — Subscription Confirmed',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <span style="color: #10B981; font-size: 28px;">&#9670;</span>
          <span style="font-size: 22px; font-weight: 700; color: #1a1a1a; margin-left: 8px;">FundLens</span>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px;">
            You're now a Pro${name ? `, ${name}` : ''}!
          </h1>
          <p style="font-size: 15px; line-height: 1.7; color: #555;">
            Your Pro subscription is active. You now have unlimited access to all FundLens features:
          </p>
          <ul style="font-size: 14px; color: #555; line-height: 2; padding-left: 20px; margin: 16px 0;">
            <li>Unlimited screener access</li>
            <li>Unlimited watchlist</li>
            <li>Compare 4+ funds side by side</li>
            <li>Full 8 data domains</li>
            <li>CSV export</li>
            <li>Priority support</li>
          </ul>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard"
               style="background: #10B981; color: #fff; padding: 12px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Start Exploring
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px;
                    font-size: 12px; color: #aaa; text-align: center;">
          &copy; 2026 FundLens. All rights reserved.
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendWelcome, sendSubscriptionConfirm };
