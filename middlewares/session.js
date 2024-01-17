// export function attachCsrfToken (url, cookie, value) {
//   return function (req, res, next) {
//     console.log(url)
//     console.log(req.url)
//     if (req.url === url) {
//       res.cookie(cookie, value)
//     }
//     next()
//   }
// }
export const attachCsrfToken = (route, cookieName, csrfToken) => {
  return (req, res, next) => {
    // Configura la cookie con SameSite=None si es necesario (asegúrate de que tu conexión sea HTTPS)
    // const isSecure = req.secure || (req.headers['x-forwarded-proto'] === 'https')
    // const sameSiteConfig = isSecure ? 'None' : 'Lax' // Puedes ajustar esto según tus necesidades

    res.cookie(cookieName, csrfToken, {
      sameSite: 'None',
      secure: true,
      httpOnly: false,
      domain: 'neon-dragon-b1bc62.netlify.app', // Ajusta según tu dominio de la aplicación React
      path: '/' // Ajusta según tus necesidades
    })

    next()
  }
}
