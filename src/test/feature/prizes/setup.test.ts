import { prisma } from '../../../utils/prismaHelper'
import { categories } from '../../../data/data'
import request from 'supertest'

const baseURL = 'http://localhost'

describe('Given prizes', () => {
  test('Should reset prizes WHEN no input', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN

    const apiResponse = await request(baseURL).post('/prizes/setup')

    // THEN

    const dbCount = await prisma.prize.count()

    expect(apiResponse.status).toBe(200)
    expect(dbCount).toBe(categories.length)
  })

  test('Should set prizes WHEN got input', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN

    const apiResponse = await request(baseURL)
      .post('/prizes/setup')
      .send({
        categories: [
          {
            id: 'prize_1',
            name: 'Prize #1',
            daily: -1,
            total: -1,
            odds: -1,
            isDefault: true
          }
        ]
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')

    // THEN

    const dbCount = await prisma.prize.count()

    expect(apiResponse.status).toBe(200)
    expect(dbCount).toBe(1)
  })

  test('Should return 500 WHEN got invalid input', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN

    const apiResponse = await request(baseURL)
      .post('/prizes/setup')
      .send({
        categories: []
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')

    // THEN

    expect(apiResponse.status).toBe(500)
  })
})

describe('Given no prizes', () => {
  test('Should reset prizes WHEN no input', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})
    // WHEN

    const apiResponse = await request(baseURL).post('/prizes/setup')

    // THEN

    const dbCount = await prisma.prize.count()

    expect(apiResponse.status).toBe(200)
    expect(dbCount).toBe(categories.length)
  })

  test('Should set prizes WHEN got input', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})
    // WHEN

    const apiResponse = await request(baseURL)
      .post('/prizes/setup')
      .send({
        categories: [
          {
            id: 'prize_1',
            name: 'Prize #1',
            daily: -1,
            total: -1,
            odds: -1,
            isDefault: true
          }
        ]
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')

    // THEN

    const dbCount = await prisma.prize.count()

    expect(apiResponse.status).toBe(200)
    expect(dbCount).toBe(1)
  })
})
