import { prisma } from '../utils/prismaHelper'

export default class Prize {
  id: string
  name: string
  total: number
  daily: number
  odds: number
  isDefault: boolean

  constructor (id: string, name: string, total: number, daily: number, odds: number, isDefault: boolean) {
    this.id = id
    this.name = name
    this.total = total
    this.daily = daily
    this.odds = odds
    this.isDefault = isDefault
  }

  static async create (prize: Prize): Promise<void> {
    await prisma.prize.create({
      data: {
        id: prize.id,
        name: prize.name,
        total: prize.total,
        daily: prize.daily,
        odds: prize.odds,
        isDefault: prize.isDefault
      }
    })
  }

  static async getAll (): Promise<Prize[]> {
    return (await prisma.prize.findMany()).map(p => new Prize(p.id, p.name, p.total, p.daily, p.odds.toNumber(), p.isDefault))
  }

  static async deleteAll (): Promise<void> {
    await prisma.prize.deleteMany()
  }

  static async getQuota (prize: Prize): Promise<{ daily: number, total: number }> {
    const result = await prisma.prize.findFirst({
      where: {
        id: prize.id
      }
    })
    if (result != null) {
      return result
    } else {
      return {
        daily: 0,
        total: 0
      }
    }
  }
}
