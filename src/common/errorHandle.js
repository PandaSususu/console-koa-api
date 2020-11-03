export default (ctx, next) => {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        data: {},
        message: 'Protected resource, use Authorization header to get access'
      };
    } else {
      throw err;
    }
  });
}