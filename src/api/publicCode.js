import svgCaptcha from 'svg-captcha'

function getCode(ctx) {
  console.log('xxxx')
  const body = ctx.request.query
  console.log(body)
  const captcha = svgCaptcha.create()
  ctx.body = {
    "code": 200,
    "data": {
      "svg": captcha.data,
      "text": captcha.text,
    }
  }
}

export default getCode