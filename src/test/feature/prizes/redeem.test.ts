import { prisma } from '../../../utils/prismaHelper'
import { categories } from '../../../data/data'
import Prize from '../../../models/prize'
import request from 'supertest'

const baseURL = 'http://localhost'

describe('Given drawn prizes', () => {
  const customerId = '1234'
  test('Should return 200 WHEN submit entryId and phone', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const prize = await getFirstPrize()
    const winner = await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: new Date(),
        phone: ''
      }
    })
    const entryId = winner.entryId
    const apiResponse = await request(baseURL)
      .post('/prizes/redeem')
      .send({
        entryId,
        phone: '97879787'
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')

    // THEN
    expect(apiResponse.status).toBe(200)
  })

  test('Should return 400 WHEN submit invalid entryId and valid phone', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const prize = await getFirstPrize()
    const winner = await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: new Date(),
        phone: ''
      }
    })
    const entryId = winner.entryId
    const apiResponse = await request(baseURL)
      .post('/prizes/redeem')
      .send({
        entryId: entryId + 'error',
        phone: '97879787'
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')

    // THEN
    expect(apiResponse.status).toBe(400)
  })

  test('Should return 400 WHEN submit valid entryId and invalid phone', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const prize = await getFirstPrize()
    const winner = await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: new Date(),
        phone: ''
      }
    })
    const entryId = winner.entryId
    const apiResponse = await request(baseURL)
      .post('/prizes/redeem')
      .send({
        entryId,
        phone: 'a97879787'
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')

    // THEN
    expect(apiResponse.status).toBe(400)
  })

  test('Should return 400 WHEN submit invalid entryId and invalid phone', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const prize = await getFirstPrize()
    const winner = await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: new Date(),
        phone: ''
      }
    })
    const entryId = winner.entryId
    const apiResponse = await request(baseURL)
      .post('/prizes/redeem')
      .send({
        entryId: entryId + 'error',
        phone: '97879787' + 'error'
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')

    // THEN
    expect(apiResponse.status).toBe(400)
  })

  test('Should return 400 WHEN submit empty body', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const prize = await getFirstPrize()
    await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: new Date(),
        phone: ''
      }
    })
    const apiResponse = await request(baseURL).post('/prizes/redeem')

    // THEN
    expect(apiResponse.status).toBe(400)
  })

  test('Should return 400 WHEN already redeemed', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})

    // GIVEN
    const cats = categories
    await prisma.prize.createMany({
      data: cats
    })
    // WHEN
    const prize = await getFirstPrize()

    const winner = await prisma.winner.create({
      data: {
        entryId: '1234',
        customerId,
        prizeId: prize.id,
        createdAt: new Date(),
        phone: '',
        redeemedAt: new Date()
      }
    })
    const entryId = winner.entryId
    const apiResponse = await request(baseURL).post('/prizes/redeem').send({
      entryId,
      phone: '12345678'
    })

    // THEN
    expect(apiResponse.status).toBe(400)
  })
})

describe('Given no drawn prize', () => {
  test('Should return 400', async () => {
    // reset db
    await prisma.winner.deleteMany({})
    await prisma.prize.deleteMany({})
    // WHEN
    const apiResponse = await request(baseURL).post('/prizes/redeem').send({
      entryId: '1',
      phone: '12341234'
    })

    // THEN
    expect(apiResponse.status).toBe(400)
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
