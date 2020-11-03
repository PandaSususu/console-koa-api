import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
async function sendEamil(emailInfo) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: '1271250334@qq.com', // generated ethereal user
      pass: 'jcvtsuhzdrpbggff', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"认证邮箱" <1271250334@qq.com>', // sender address
    to: emailInfo.email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  return emailInfo
}

export default sendEamil