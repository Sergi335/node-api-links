import { z } from 'zod'

const linkZodSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).min(1).max(250).default('Name'),
  description: z.string().max(250).default('Description').optional(),
  URL: z.string().optional(),
  imgURL: z.string().url(),
  escritorio: z.string().min(1).max(250).default('Desktop'),
  panel: z.string().min(1).max(250).default('Panel'),
  idpanel: z.string(),
  orden: z.number().min(0).int().default(0),
  user: z.string().min(1).max(250),
  notes: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  bookmark: z.boolean().optional()
})

export function validateLink (link) {
  return linkZodSchema.safeParse(link)
}
export function validatePartialLink (link) {
  return linkZodSchema.partial().safeParse(link)
}
