import svgCaptcha from 'svg-captcha'

function getCode(ctx) {
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