const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //   const transport = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });
  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'c58e387c60b93e',
      pass: 'a4a3b062f52945',
    },
  });

  const mailOptions = {
    from: 'Oleksii Burdeniuk <alejandroburdenyk@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const res = await transport.sendMail(mailOptions);
  console.log('res', res);
};

module.exports = sendEmail;
