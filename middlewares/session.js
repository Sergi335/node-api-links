export function attachCsrfToken (url, cookie, value) {
  return function (req, res, next) {
    console.log(url)
    console.log(req.url)
    if (req.url === url) {
      res.cookie(cookie, value)
    }
    next()
  }
}
