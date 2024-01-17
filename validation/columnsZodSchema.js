import { z } from 'zod'

const columnZodSchema = z.object({
  id: z.string().optional(),
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).min(1).max(250).default('Name'),
  escritorio: z.string().min(1).max(250),
  order: z.number().min(0).int().default(0),
  user: z.string().min(1).max(250)
})

export function validateColumn (link) {
  return columnZodSchema.safeParse(link)
}
export function validatePartialColumn (link) {
  return columnZodSchema.partial().safeParse(link)
}
