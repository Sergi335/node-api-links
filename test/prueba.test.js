import { test, expect } from 'vitest'
function sum (a, b) {
  return a + b
}
test('comprobar que la suma de 1 + 2 es 3', () => {
  const result = sum(1, 2)
  expect(result).toBe(3)
})
