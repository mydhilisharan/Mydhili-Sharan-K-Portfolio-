export default async function handler(req, res) {
  // Allow CORS from any origin (so portfolio browser can call this)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer re_Hq94DW6Y_3ERxJrV6VwWdj41XibvnY6gX'
      },
      body: JSON.stringify({
        from: 'JARVIS Portfolio <onboarding@resend.dev>',
        to:   ['mydhilisharan4766@gmail.com'],
        reply_to: email,
        subject: `New Portfolio Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via JARVIS Portfolio Contact Form`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#0a0f1e;color:#e0f7ff;padding:32px;border-radius:12px;border:1px solid #00eaff33">
            <h2 style="color:#00eaff;margin-bottom:4px">New Portfolio Message</h2>
            <hr style="border-color:#00eaff33;margin-bottom:20px">
            <p><strong style="color:#00eaff">Name:</strong> ${name}</p>
            <p><strong style="color:#00eaff">Email:</strong> <a href="mailto:${email}" style="color:#00eaff">${email}</a></p>
            <p><strong style="color:#00eaff">Message:</strong></p>
            <div style="background:#0d1b2a;padding:16px;border-radius:8px;border-left:3px solid #00eaff;white-space:pre-wrap">${message}</div>
            <p style="margin-top:24px;font-size:12px;color:#4a6070">Reply directly to this email to respond to ${name}.</p>
          </div>
        `
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend error');
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
