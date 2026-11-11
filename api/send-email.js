export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, fullName, gotra, rashi, packageTitle, orderId, donationAmount } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    // Email HTML template with consecrated aesthetic
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6EE; margin: 0; padding: 24px; color: #2C2621; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 4px 20px rgba(184, 115, 51, 0.08); }
          .header { background: linear-gradient(135deg, #B87333 0%, #D4A373 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
          .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 32px 24px; }
          .badge-box { background: #FAF6EE; border: 1px dashed #D4A373; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .badge-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #B87333; font-weight: 700; margin-bottom: 8px; }
          .btn { display: inline-block; background: #B87333; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
          .footer { background: #FAF6EE; padding: 20px; text-align: center; font-size: 12px; color: #8C827A; border-top: 1px solid #EADBCC; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>वैदिक शांति • VEDIC SHANTI</h1>
            <p>Consecrated Sadhana & Upaya Kit Confirmation</p>
          </div>
          <div class="content">
            <p>Hari Om <strong>${fullName || 'Seeker'}</strong>,</p>
            <p>Your sacred resolution (Sankalp) for <strong>${packageTitle || 'Vedic Remedial Seva'}</strong> has been consecrated into our morning prayers.</p>
            
            <div class="badge-box">
              <div class="badge-title">Consecration Summary</div>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Order ID:</strong> ${orderId || 'VS-' + Date.now()}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Gotra:</strong> ${gotra || 'Kashyapa (Universal)'}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Rashi / Nakshatra:</strong> ${rashi || 'Not Specified'}</p>
              ${donationAmount > 0 ? `<p style="margin: 4px 0; font-size: 14px; color: #2E7D32;"><strong>Vidya Dāna (Education Offering):</strong> ₹${donationAmount}</p>` : ''}
            </div>

            <p>You can listen to your consecrated 432 Hz chants, record your 21-day morning seva, and download your energized mobile yantra at any time through your Seva Portal.</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="https://instagram.com/vedicshanti_official" class="btn" style="color: #ffffff;">Join Daily Seva Updates (@vedicshanti_official)</a>
            </div>

            <p style="font-size: 13px; color: #666;">May this intentional seva dissolve past planetary bondages and bring peace to your lineage.</p>
          </div>
          <div class="footer">
            Vedic Shanti • Ancient Remedies for Modern Peace<br>
            Follow our sunrise animal feedings on Instagram: @vedicshanti_official
          </div>
        </div>
      </body>
      </html>
    `;

    // If Resend API key is provided, deliver real email
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Vedic Shanti <onboarding@resend.dev>',
          to: [email],
          subject: `🕉️ Your Consecrated Sadhana Kit: ${packageTitle || 'Vedic Shanti'}`,
          html: emailHtml
        })
      });

      const data = await response.json();
      return res.status(200).json({ success: true, delivered: true, id: data.id });
    }

    // Fallback if no API key configured yet
    console.log(`[Email Simulation] Delivered kit to ${email} for order ${orderId}`);
    return res.status(200).json({
      success: true,
      delivered: false,
      message: 'Email registered. Connect RESEND_API_KEY in Vercel to activate live inbox delivery.'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
