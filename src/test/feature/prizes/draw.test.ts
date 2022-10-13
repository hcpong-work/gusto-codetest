import { prisma } from '../../../utils/prismaHelper'
import { categories } from '../../../data/data'
import Prize from '../../../models/prize'
import request from 'supertest'

const baseURL = 'http://localhost'

describe('Given default prizes', () => {
  beforeEach(async () => {
  })

  test('Should return 200 WHEN not played', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const customerId = '1234'
    const apiResponse = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId)

    // THEN
    expect(apiResponse.status).toBe(200)
  })

  test('Should return 200 WHEN not played, but other players played', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const customerId = '1234'
    const prize = await getFirstPrize()
    const now = new Date()
    await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId: customerId + '5',
        prizeId: prize.id,
        createdAt: now,
        phone: ''
      }
    })
    const apiResponse = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId)

    // THEN
    expect(apiResponse.status).toBe(200)
  })

  test('Should return 200 WHEN not played today, but played 1 day before', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const customerId = '1234'
    const prize = await getFirstPrize()
    const now = new Date()
    now.setDate(now.getDate() - 1)
    await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: now,
        phone: ''
      }
    })

    const apiResponse = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId)

    // THEN
    expect(apiResponse.status).toBe(200)
  })

  test('Should return 400 WHEN already played today', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const customerId = '1234'
    const prize = await getFirstPrize()
    const now = new Date()
    now.setMinutes(now.getMinutes() - 1)
    await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: now,
        phone: ''
      }
    })

    const apiResponse = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId)

    // THEN
    expect(apiResponse.status).toBe(400)
  })

  test('Should return 401 WHEN no header provided', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const customerId = '1234'
    const prize = await getFirstPrize()
    const now = new Date()
    now.setMinutes(now.getMinutes() - 1)
    await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: now,
        phone: ''
      }
    })

    const apiResponse = await request(baseURL).post('/prizes/draw')

    // THEN
    expect(apiResponse.status).toBe(401)
  })

  test('Should return different entryId WHEN draw twice', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const customerId1 = '1'
    const customerId2 = '2'

    const apiResponse1 = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId1)

    const apiResponse2 = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId2)

    // THEN
    expect(apiResponse1.body.entryId).not.toBe(apiResponse2.body.entryId)
  })
})

describe('Given no prize', () => {
  test('Should return 400 WHEN draw with customerId', async () => {
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})
    // WHEN
    const customerId = '1234'
    const apiResponse = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId)

    // THEN
    expect(apiResponse.status).toBe(400)
  })

  test('Should return 401 WHEN draw without customerId', async () => {
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})
    // WHEN
    const apiResponse = await request(baseURL).post('/prizes/draw')

    // THEN
    expect(apiResponse.status).toBe(401)
  })
})

describe('Given limited prizes', () => {
  test('Should draw limited prize WHEN within quota ', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    await prisma.prize.createMany({
      data: [
        {
          id: 'limited',
          name: 'Limited',
          odds: 1,
          daily: 1,
          total: 1,
          isDefault: false
        },
        {
          id: 'no_prize',
          name: 'No Prize',
          odds: 0,
          daily: -1,
          total: -1,
          isDefault: true
        }
      ]
    })
    // WHEN
    const customerId = '1234'
    const apiResponse = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId)

    // THEN
    const winner = await prisma.winner.findFirst()
    expect(apiResponse.status).toBe(200)
    expect(winner?.prizeId).toBe('limited')
  })
  test('Should not draw limited prize WHEN over quota ', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    await prisma.prize.createMany({
      data: [
        {
          id: 'limited',
          name: 'Limited',
          odds: 1,
          daily: 1,
          total: 1,
          isDefault: false
        },
        {
          id: 'no_prize',
          name: 'No Prize',
          odds: 0,
          daily: -1,
          total: -1,
          isDefault: true
        }
      ]
    })
    // WHEN
    const customerId = '1234'
    const apiResponse1 = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId + '1')
    const winner1 = await prisma.winner.findFirst({
      orderBy: {
        id: 'desc'
      }
    })
    const apiResponse2 = await request(baseURL)
      .post('/prizes/draw')
      .set('Authorization', customerId + '2')
    const winner2 = await prisma.winner.findFirst({
      orderBy: {
        id: 'desc'
      }
    })
    // THEN

    expect(apiResponse1.status).toBe(200)
    expect(apiResponse2.status).toBe(200)
    expect(winner1?.prizeId).toBe('limited')
    expect(winner2?.prizeId).toBe('no_prize')
  })
})

// Helper
async function getFirstPrize (): Promise<Prize> {
  const _prize = await prisma.prize.findFirst()
  if (_prize === null) {
    throw Error('error')
  }
  const prize = new Prize(
    _prize.id,
    _prize.name,
    _prize.total,
    _prize.daily,
    _prize.odds.toNumber(),
    _prize.isDefault
  )
  return prize
}
