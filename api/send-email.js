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
    const {
      email,
      fullName,
      gotra,
      rashi,
      packageTitle,
      planet,
      animal,
      offering,
      mantra,
      homePooja,
      orderId,
      donationAmount
    } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    // Email HTML template with full Sankalp Certificate, Mantra, Offering & Home Pooja
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6EE; margin: 0; padding: 24px; color: #2C2621; }
          .container { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 2px solid #D4A373; box-shadow: 0 8px 24px rgba(184, 115, 51, 0.12); }
          .header { background: linear-gradient(135deg, #B87333 0%, #D4A373 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1.5px; }
          .header p { margin: 6px 0 0; opacity: 0.95; font-size: 13px; letter-spacing: 0.5px; }
          .content { padding: 32px 24px; }
          .certificate-box { background: #FFFDF9; border: 2px solid #B87333; border-radius: 14px; padding: 20px; margin: 20px 0; text-align: center; }
          .cert-header { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B87333; font-weight: 700; }
          .cert-name { font-size: 22px; font-family: Georgia, serif; color: #2C2621; margin: 8px 0; font-weight: bold; }
          .section-box { background: #FAF6EE; border: 1px dashed #D4A373; border-radius: 12px; padding: 16px 18px; margin: 16px 0; }
          .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #B87333; font-weight: 700; margin-bottom: 8px; }
          .mantra-box { background: #FEF7EC; border-left: 4px solid #B87333; padding: 14px 16px; margin: 16px 0; border-radius: 0 10px 10px 0; font-family: Georgia, serif; font-size: 15px; color: #5C3A18; font-weight: 600; }
          .pooja-list { margin: 8px 0 0; padding-left: 18px; font-size: 13.5px; line-height: 1.65; color: #3D352E; }
          .btn { display: inline-block; background: #B87333; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
          .footer { background: #FAF6EE; padding: 20px; text-align: center; font-size: 12px; color: #8C827A; border-top: 1px solid #EADBCC; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>वैदिक शांति • VEDIC SHANTI</h1>
            <p>OFFICIAL SANKALP CERTIFICATE & HOME SADHANA GUIDE</p>
          </div>
          <div class="content">
            <p>Hari Om <strong>${fullName || 'Seeker'}</strong>,</p>
            <p>Your sacred resolution (Sankalp) has been consecrated into our sunrise prayers. Below is your official digital certificate along with your personalized mantra, our seva commitment, and your home remedy pooja steps.</p>

            <!-- Digital Sankalp Certificate -->
            <div class="certificate-box">
              <div class="cert-header">🕉️ Certificate of Sacred Consecration 🕉️</div>
              <div class="cert-name">${fullName || 'Devotee'}</div>
              <p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Gotra:</strong> ${gotra || 'Kashyapa (Universal)'} &nbsp;|&nbsp; <strong>Rashi:</strong> ${rashi || 'Universal'}</p>
              <p style="margin: 8px 0 4px; font-size: 14px; color: #B87333; font-weight: 700;">${packageTitle || 'Vedic Remedial Seva'}</p>
              <p style="margin: 0; font-size: 11px; color: #8C827A;">Sankalp Reference ID: ${orderId || 'VS-' + Date.now()}</p>
              ${donationAmount > 0 ? `<p style="margin: 8px 0 0; font-size: 12px; color: #2E7D32; font-weight: 600;">✓ Includes Vidya Dāna Education Offering: ₹${donationAmount}</p>` : ''}
            </div>

            <!-- Chosen Sacred Mantra -->
            <div class="mantra-box">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #B87333; font-family: sans-serif; margin-bottom: 4px;">Your Consecrated Mantra (Chant 108 Times Daily)</div>
              ${mantra || 'ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः'}
            </div>

            <!-- What We Offer On Your Behalf -->
            <div class="section-box">
              <div class="section-title">What Vedic Shanti Offers on Your Behalf (Sunrise Seva)</div>
              <p style="margin: 4px 0; font-size: 13.5px;"><strong>Planetary Alignment:</strong> ${planet || 'Universal Harmony'}</p>
              <p style="margin: 4px 0; font-size: 13.5px;"><strong>Sacred Creatures Served:</strong> ${animal || 'Cows, Birds & Stray Animals'}</p>
              <p style="margin: 4px 0; font-size: 13.5px;"><strong>Seva Offering Performed:</strong> ${offering || 'Fresh sattvic grains, fodder, and clean water at sunrise'}</p>
            </div>

            <!-- Simple Remedy Pooja Within Their Home -->
            <div class="section-box" style="background: #F4F8F6; border-color: #B7D4C8;">
              <div class="section-title" style="color: #2E6F56;">Simple Remedy Pooja to Perform Within Your Home</div>
              <ul class="pooja-list">
                ${(homePooja && Array.isArray(homePooja) ? homePooja : [
                  'Take a morning bath and light a pure ghee or sesame oil lamp (Diya) facing East or North.',
                  'Keep a small copper or brass bowl of clean water beside the lamp while chanting your mantra 108 times.',
                  'Offer a pinch of jaggery, soaked grains, or a small portion of your first meal to birds or animals near your home.',
                  'Pour the energized water from the bowl at the root of a Tulsi plant or clean tree.'
                ]).map(step => `<li>${step}</li>`).join('')}
              </ul>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="https://instagram.com/vedicshanti_official" class="btn" style="color: #ffffff;">View Morning Seva Proof (@vedicshanti_official)</a>
            </div>

            <p style="font-size: 12.5px; color: #666; text-align: center;">May this intentional seva dissolve past planetary bondages and bring lasting peace to your home.</p>
          </div>
          <div class="footer">
            Vedic Shanti • Classical Remedial Upayas & Sacred Seva<br>
            Official Updates: @vedicshanti_official
          </div>
        </div>
      </body>
      </html>
    `;

    // If Resend API key is provided, deliver real email directly to the user's inbox
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
          subject: `🕉️ Your Sankalp Certificate, Mantra & Home Pooja Guide: ${packageTitle || 'Vedic Shanti'}`,
          html: emailHtml
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ success: false, delivered: false, error: data });
      }
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
