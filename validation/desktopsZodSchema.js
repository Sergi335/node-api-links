import { z } from 'zod'

const desktopZodSchema = z.object({
  id: z.string().optional(),
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).min(1).max(250).default('desktop'),
  displayName: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).min(1).max(250).default('Desktop'),
  order: z.number().min(0).int().default(0),
  hidden: z.boolean().default(false),
  user: z.string().min(1).max(250)
})

export function validateDesktop (link) {
  return desktopZodSchema.safeParse(link)
}
export function validatePartialDesktop (link) {
  return desktopZodSchema.partial().safeParse(link)
}
