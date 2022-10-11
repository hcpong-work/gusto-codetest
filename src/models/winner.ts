import moment from 'moment'
import { prisma } from '../utils/prismaHelper'
import Prize from './prize'

export default class Winner {
  id: string | undefined
  phone: string
  prize: Prize
  customerId: string
  entryId: string | undefined
  createdAt: Date
  redeemedAt: Date | undefined

  constructor (
    customerId: string,
    phone: string | undefined,
    prize: Prize,
    createdAt: Date | undefined,
    redeemedAt: Date | undefined
  ) {
    this.customerId = customerId ?? ''
    this.phone = phone ?? ''
    this.prize = prize
    this.createdAt = (createdAt != null) ? createdAt : new Date()
    this.redeemedAt = redeemedAt
  }

  static makeEntryId (): string {
    const length = 16
    let result = ''
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  static async duplicatedId (testId: string): Promise<boolean> {
    const count =
      (await prisma.winner.count({
        where: {
          customerId: {
            equals: testId
          }
        }
      }))

    return count > 0
  }

  static async create (winner: Winner): Promise<Winner | null> {
    let winnerUniqueId = ''
    while (true) {
      winnerUniqueId = Winner.makeEntryId()
      if (!await Winner.duplicatedId(winnerUniqueId)) {
        break
      }
    }
    try {
      await prisma.winner.create({
        data: {
          entryId: winnerUniqueId,
          customerId: winner.customerId,
          phone: winner.phone,
          prizeId: winner.prize.id,
          createdAt: winner.createdAt
        }
      })
      winner.entryId = winnerUniqueId
    } catch (e) {
      console.log(e)
      return null
    }
    return winner
  }

  static async deleteAll (): Promise<void> {
    await prisma.winner.deleteMany()
  }

  static async customerPlayedToday (customerId: string): Promise<boolean> {
    const result = await prisma.winner.count({
      where: {
        customerId,
        createdAt: {
          gte: moment().startOf('day').toDate(),
          lte: moment().toDate()
        }
      }
    })
    return result > 0
  }

  static async entryExist (entryId: string): Promise<boolean> {
    return (
      (await prisma.winner.count({
        where: {
          entryId
        }
      })) > 0
    )
  }

  static async redeemPrize (entryId: string, phone: string): Promise<void> {
    await prisma.winner.updateMany({
      where: {
        entryId,
        redeemedAt: null
      },
      data: {
        phone,
        redeemedAt: moment().toDate()
      }
    })
  }

  static async isRedeemed (entryId: string): Promise<boolean> {
    return (
      (await prisma.winner.count({
        where: {
          entryId,
          redeemedAt: {
            not: null
          }
        }
      })) > 0
    )
  }

  static async countWinner (prize: Prize): Promise<any> {
    const allWinners = await prisma.winner.findMany({
      where: {
        prizeId: prize.id
      }
    })
    if (allWinners != null) {
      return {
        winnerDaily: allWinners.filter((winner: any) => {
          if (winner != null) {
            return moment(winner.createdAt).isSame(moment(), 'date')
          } else {
            return false
          }
        }).length,
        winnerTotal: allWinners.length
      }
    } else {
      return {
        winnerDaily: 0,
        winnerTotal: 0
      }
    }
  }
}
