export function cors (req, res, next) {
  const origin = req.header('origin')

  const ACCEPTED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']

  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-justlinks-user, x-justlinks-token')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.header('Access-Control-Allow-Credentials', 'true')

  // Si el método de la solicitud es OPTIONS, enviar una respuesta inmediata
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  // const user = NODE_ENV === 'test' ? 'SergioSR' : 'SergioSR'
  // req.user = { name: user }
  next()
}
