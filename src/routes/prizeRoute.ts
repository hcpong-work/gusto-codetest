import { body } from 'express-validator'
import * as prizeController from '../controllers/prizeController'

const express = require('express')
const router = express.Router()

router.post('/draw',
  prizeController.actionDraw
)
router.post('/redeem',
  body('entryId').notEmpty().withMessage('EntryId cannot be empty'),
  body('phone').notEmpty().withMessage('Phone cannot be empty').isMobilePhone('zh-HK').withMessage('Phone is not in correct format'),
  prizeController.actionRedeem
)
router.post('/setup',
  prizeController.actionSetup
)

module.exports = router
