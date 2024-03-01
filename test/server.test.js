import supertest from 'supertest'
import { afterAll, test } from 'vitest'
import { app, server } from '../app.js'

const api = supertest(app)

test('Get all desktops', async () => {
  const response = await api
    .get('/desktops')
    // .redirects(1)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  console.log(response.body)
})
test('Generate error when a desktop exists', async () => {
  const response = await api
    .post('/desktops')
    .send({
      name: 'test',
      displayName: 'Test',
      orden: 0,
      hidden: false
    })
    .expect(500)
    .expect('Content-Type', /application\/json/)
  console.log(response.body)
})
test('Create Desktop', async () => {
  const response = await api
    .post('/desktops')
    .send({
      name: 'test2',
      displayName: 'Test2',
      orden: 0,
      hidden: false
    })
    .expect(201)
    .expect('Content-Type', /application\/json/)
  console.log(response.body)
})
test('Delete Desktop', async () => {
  const response = await api
    .delete('/desktops')
    .send({
      name: 'test2'
    })
  console.log(response.body)
})
afterAll(() => {
  server.close()
})
