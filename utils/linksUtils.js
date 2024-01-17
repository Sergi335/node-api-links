import * as cheerio from 'cheerio'
import axios from 'axios'
import https from 'node:https'
import crypto from 'node:crypto'

export const getLinkNameByUrlLocal = async ({ url }) => {
  try {
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)
    const title = $('title').text()
    console.log('El título de la página es: ' + title)
    return title
  } catch (error) {
    const altTitle = new URL(url).host
    console.log('Hubo un error al obtener el título de la página:', error)
    return altTitle // Lanzar el error para manejarlo en la función llamante
  }
}
export const getLinkStatusLocal = async ({ url }) => {
  const agentOptions = {
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
  }
  const agent = new https.Agent(agentOptions)
  try {
  // Realizar la solicitud HTTP con Axios
    const response = await axios.get(url, { httpsAgent: agent })
    // const response = await fetch(url, { mode: 'no-cors' })
    const statusCode = response.status

    let status
    if (statusCode >= 100 && statusCode <= 199) {
      status = 'informational'
    } else if (statusCode >= 200 && statusCode <= 299) {
      status = 'success'
    } else if (statusCode >= 300 && statusCode <= 399) {
      status = 'redirect'
    } else if (statusCode >= 400 && statusCode <= 499) {
      status = 'clientErr'
    } else if (statusCode >= 500 && statusCode <= 599) {
      status = 'serverErr'
    }

    return { status }
  } catch (error) {
    if (error.response) {
    // Error de respuesta HTTP con un código de estado
      const statusCode = error.response.status
      let status

      if (statusCode >= 100 && statusCode <= 199) {
        status = 'informational'
      } else if (statusCode >= 200 && statusCode <= 299) {
        status = 'success'
      } else if (statusCode >= 300 && statusCode <= 399) {
        status = 'redirect'
      } else if (statusCode >= 400 && statusCode <= 499) {
        status = 'clientErr'
      } else if (statusCode >= 500 && statusCode <= 599) {
        status = 'serverErr'
      }
      if (statusCode === 403) {
        status = 'success'
      }
      return { status }
    } else {
    // Otro tipo de error
      console.error('Error:', error)
      return ({ error: 'Fallo al obtener datos' })
    }
  }
}
