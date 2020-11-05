import nodemailer from 'nodemailer';
import qs from 'querystring'

import config from './index'

// async..await is not allowed in global scope, must use a wrapper
async function sendEamil(emailInfo) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: '1271250334@qq.com', // generated ethereal user
      pass: 'dokvijcmefmlbabh', // generated ethereal password
    },
  });

  const baseUrl = config.BaseUrl
  const router = emailInfo.type === 'email'? '/confirm' : '/reset'
  const jumpLink = `${ baseUrl }/#${ router }?` + qs.stringify(emailInfo.data)
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"重置邮箱" <1271250334@qq.com>', // sender address
    to: emailInfo.email, // list of receivers
    subject: `《1024社区》确定重置邮箱链接`, // Subject line
    text: `欢迎来到官方社区，您好，${ emailInfo.userName }攻城狮，重置链接有效时间30分钟，请您尽快修改哦`, // plain text body
    html: `
    <div style="width: 420px; margin: 20px auto; border: 1px solid #999;">
      <h1 style="font-size: 18px; color: #66997B; background-color: #333; padding: 10px 8px; font-weight: normal; margin: 0;">1024社区——欢迎来到官方社区</h1>
      <div style="padding: 20px 10px;">
        <p style="margin: 0; font-size: 14px;">您好，<span style="color: #009688">${ emailInfo.userName }</span>攻城狮，重置链接有效时间为30分钟，请在${ emailInfo.expire }之前重置您的邮箱</p>
        <a style="display: inline-block; padding: 8px 6px; border: none; background-color: #009688; color: #fff; font-size: 12px; outline: none; margin: 10px 0; text-decoration: none;" href="${ jumpLink }">立即重置邮箱</a>
        <p style="margin: 0; font-size: 12px; background-color: #f2f2f2; padding: 8px 4px; color: #333;">如果该邮箱不是本人操作，请勿进行激活！否则您的邮箱将会被别人绑定。</p>
      </div>
      <div style="text-align: center; padding: 10px 0; background-color: #f2f2f2; font-size: 12px; color: #999;">系统邮箱，无需回复</div>
    </div>
    `,
  });

  return emailInfo;
}

export default sendEamil;
