const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const templates = {
    registration: {
        subject: 'Verify your e‑mail for VolOd',
        html: (code) => `
      <p>Hello!</p>
      <p>You are registering on <b>VolOd</b>.  
      Use this code to verify your e‑mail:</p>
      <h2>${code}</h2>
      <p>The code expires in 5 minutes. If you didn’t request it, just ignore this email.</p>
    `
    },
    login: {
        subject: 'Your VolOd login code',
        html: (code) => `
      <p>Hello!</p>
      <p>You are trying to sign in to <b>VolOd</b>.  
      Use this one‑time code to continue:</p>
      <h2>${code}</h2>
      <p>The code expires in 5 minutes. If this wasn’t you, ignore this email.</p>
    `
    },
    'settings-change': {
        subject: 'Confirm changes to your VolOd account',
        html: (code) => `
      <p>Hello!</p>
      <p>We received a request to change your account settings on <b>VolOd</b>.  
      Confirm with this code:</p>
      <h2>${code}</h2>
      <p>The code expires in 5 minutes. If you didn’t request this, secure your account immediately.</p>
    `
    }
};



async function sendOTPEmail(email, code, templateKey = 'registration') {
    const tpl = templates[templateKey] || templates.registration;

    await transporter.sendMail({
        from: process.env.FROM_DISPLAY,
        to: email,
        subject: tpl.subject,
        html: tpl.html(code)
    });
}

module.exports = { sendOTPEmail };
