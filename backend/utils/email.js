// const fs = require('fs');
// const path = require('path');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// // Load credentials
// const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
// const { client_secret, client_id, redirect_uris } = CREDENTIALS.installed;

// const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// // First-time only: generate auth URL
// const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
// const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });

// console.log('Authorize this app by visiting:', authUrl);

// // Then, paste the code received here
// const CODE = 'PASTE_YOUR_AUTH_CODE_HERE';

// oAuth2Client.getToken(CODE, (err, token) => {
//   if (err) return console.error('Error retrieving token', err);
//   oAuth2Client.setCredentials(token);
//   sendEmail(oAuth2Client);
// });

// function sendEmail(auth) {
//   const accessToken = auth.credentials.access_token;

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: 'your-email@gmail.com',
//       clientId: client_id,
//       clientSecret: client_secret,
//       refreshToken: auth.credentials.refresh_token,
//       accessToken: accessToken
//     }
//   });

//   const mailOptions = {
//     from: 'Your Name <your-email@gmail.com>',
//     to: 'recipient@example.com',
//     subject: 'Hello from Gmail API',
//     text: 'This email was sent using Gmail API and OAuth2!',
//     html: '<b>This email was sent using Gmail API and OAuth2!</b>'
//   };

//   transporter.sendMail(mailOptions, (err, result) => {
//     if (err) return console.error('Email error:', err);
//     console.log('Email sent!', result.response);
//   });
// }

// import { Resend } from 'resend';

// const resend = new Resend('re_6CGKb1hs_3MUZMGwUTboqaYFDiFeeXqBs');

// export async function sendMail(to, subject, message) {
//   try {
//     const result = await resend.emails.send({
//       from: 'yoshinotakashi69@gmail.com',
//       to: to,
//       subject: subject,
//       html: `<p><strong>${message}</strong></p>`
//     });
//     // Resend returns { id, ... } on success, or { error, ... } on failure
//     if (result && result.id) {
//       return true;
//     } else {
//       console.error('Resend error:', result);
//       return false;
//     }
//   } catch (err) {
//     console.error('Resend exception:', err);
//     return false;
//   }
// }