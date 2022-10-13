import { Request, Response } from 'express'
import { env } from 'process'
import { categories } from '../data/data'
import Prize from '../models/prize'
import Winner from '../models/winner'
import { message } from '../utils/message'

import { validationResult } from 'express-validator'
const { lock } = require('simple-redis-mutex')
const Redis = require('ioredis')
const redis = new Redis(env.REDIS_URL)

async function getPrize (customerId: string, prize: Prize, fallback: Prize | undefined): Promise<Winner | null> {
  const unlock = await lock(redis, 'draw-lock')
  let finalPrize = (fallback != null) ? fallback : prize

  const { daily, total } = await Prize.getQuota(prize)
  const { winnerDaily, winnerTotal } = await Winner.countWinner(prize)

  // check basic quota
  if ((daily === -1 || winnerDaily < daily) && (total === -1 || winnerTotal < total)) {
    finalPrize = prize
  }

  let winner: Winner | null = new Winner(customerId, '123456', finalPrize, undefined, undefined)
  winner = await Winner.create(winner)
  if (winner == null) {
    return null
  }
  const entryId = winner.entryId ?? ''
  await unlock()
  return { ...winner, entryId }
}

export async function actionSetup (req: Request, res: Response): Promise<any> {
  try {
    await Winner.deleteAll()
    await Prize.deleteAll()
  } catch (e) {
    res.status(500).json({})
    console.error(e)
    return
  }
  let cats = categories

  cats = req.body?.categories ?? cats

  if (cats.filter(cat => cat.isDefault).length !== 1) {
    res.status(500).json({})
    return
  }
  for (const cat of cats) {
    const prize = new Prize(
      cat.id,
      cat.name,
      cat.total,
      cat.daily,
      cat.odds,
      cat.isDefault
    )
    try {
      await Prize.create(prize)
    } catch (e) {
      res.status(500).json({})
      console.error(e)
      return
    }
  }
  res.status(200).json({})
}

export async function actionRedeem (req: Request, res: Response): Promise<any> {
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ msg: message.INPUT_ERROR + ': ' + validationErrors.array().map(error => error.msg).join(', ') })
  }

  if (req.body === undefined || req.body.phone === undefined || req.body.entryId === undefined) {
    return res.status(400).json({ msg: message.NO_INPUT })
  }

  const entryIdCorrect = await Winner.entryExist(req.body.entryId)

  if (!entryIdCorrect) {
    return res.status(400).json({
      msg: message.WRONG_ENTRY_ID
    })
  }

  const alreadyRedeemed = await Winner.isRedeemed(req.body.entryId)
  if (alreadyRedeemed) {
    return res.status(400).json({
      msg: message.ALREADY_REDEEMED
    })
  }

  await Winner.redeemPrize(req.body.entryId, req.body.phone)
  res.status(200).json({
    msg: message.WAIT_FOR_SMS
  })
}

export async function actionDraw (req: Request, res: Response): Promise<any> {
  // check customer id
  // super simplified version
  if (req.headers.authorization === undefined) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }
  const customerId = req.headers.authorization ?? ''
  if (await Winner.customerPlayedToday(customerId)) {
    return res.status(400).json({
      msg: message.JOIN_TMR
    })
  }
  const randomNum = Math.random()
  const allPrizes = (await Prize.getAll())
  let result = null
  // sort by ascending first
  const defaultPrize = allPrizes.find(prize => prize.isDefault)
  if (defaultPrize === undefined || defaultPrize === null) {
    return res.status(400).json({
      msg: message.NOT_INIT
    })
  }

  const prizes = allPrizes.filter(prize => !prize.isDefault).sort((a, b) => {
    return a?.odds - b?.odds
  })

  let prevOddsSum = 0
  for (const prize of prizes) {
    if (randomNum < prize.odds + prevOddsSum) {
      prevOddsSum += prize.odds
      result = await getPrize(customerId, prize, defaultPrize)
      break
    }
  }
  if (result == null) {
    result = await getPrize(customerId, defaultPrize, undefined)
  }
  if (result != null) {
    return res.json({
      msg: `You win '${result.prize.name}'!`,
      entryId: result.entryId
    })
  } else {
    return res.json('error')
  }
}
