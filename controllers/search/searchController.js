import { linkModel } from '../../models/linkModel.js'
export class searchController {
  static async searchLinks (req, res) {
    try {
      const query = req.query.query
      const user = req.user.name
      console.log(user)

      if (query.length < 2) {
        // Si la consulta tiene menos de tres letras, no se realiza la búsqueda
        return res.json([])
      }

      const regexQuery = new RegExp(`.*${query}.*`, 'i')

      const result = await linkModel.searchLinks({ user, query: regexQuery })
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Error al buscar enlaces' })
    }
  }
}
