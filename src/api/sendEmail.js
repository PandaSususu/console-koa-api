import emailConfig from '../config/emailConfig'

async function sendEmail(ctx) {
  let { body } = ctx.request
  console.log(body)
  try {
    let result = await emailConfig(body)
    console.log(result)
    ctx.body = {
      "code": 200,
      "message": "邮箱发送成功！",
      "data": result
    }
  } catch (error) {
    console.log(error)
  }
}

export default sendEmail