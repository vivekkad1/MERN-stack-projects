import nodemailer from 'nodemailer';

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  html?: string;
}) => {
  // Use a real SMTP service or Ethereal for testing
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_EMAIL || 'dino.lindgren69@ethereal.email',
      pass: process.env.SMTP_PASSWORD || 'xK1yW4sQ1y1yW4sQ',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'CommerceHub'} <${process.env.FROM_EMAIL || 'noreply@commercehub.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};
