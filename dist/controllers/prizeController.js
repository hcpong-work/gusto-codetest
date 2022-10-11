"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionDraw = exports.actionRedeem = exports.actionSetup = void 0;
const process_1 = require("process");
const data_1 = require("../data/data");
const prize_1 = __importDefault(require("../models/prize"));
const winner_1 = __importDefault(require("../models/winner"));
const message_1 = require("../utils/message");
const express_validator_1 = require("express-validator");
const { lock } = require('simple-redis-mutex');
const Redis = require('ioredis');
const redis = new Redis(process_1.env.REDIS_URL);
function getPrize(customerId, prize, fallback) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const unlock = yield lock(redis, 'draw-lock');
        let finalPrize = (fallback != null) ? fallback : prize;
        const { daily, total } = yield prize_1.default.getQuota(prize);
        const { winnerDaily, winnerTotal } = yield winner_1.default.countWinner(prize);
        // check basic quota
        if ((daily === -1 || winnerDaily < daily) && (total === -1 || winnerTotal < total)) {
            finalPrize = prize;
        }
        let winner = new winner_1.default(customerId, '123456', finalPrize, undefined, undefined);
        winner = yield winner_1.default.create(winner);
        if (winner == null) {
            return null;
        }
        const entryId = (_a = winner.entryId) !== null && _a !== void 0 ? _a : '';
        yield unlock();
        return Object.assign(Object.assign({}, winner), { entryId });
    });
}
function actionSetup(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield winner_1.default.deleteAll();
            yield prize_1.default.deleteAll();
        }
        catch (e) {
            res.status(500).json({});
            console.error(e);
            return;
        }
        let cats = data_1.categories;
        cats = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.categories) !== null && _b !== void 0 ? _b : cats;
        if (cats.filter(cat => cat.isDefault).length !== 1) {
            res.status(500).json({});
            return;
        }
        for (const cat of cats) {
            const prize = new prize_1.default(cat.id, cat.name, cat.total, cat.daily, cat.odds, cat.isDefault);
            try {
                yield prize_1.default.create(prize);
            }
            catch (e) {
                res.status(500).json({});
                console.error(e);
                return;
            }
        }
        res.status(200).json({});
    });
}
exports.actionSetup = actionSetup;
function actionRedeem(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const validationErrors = (0, express_validator_1.validationResult)(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ msg: message_1.message.INPUT_ERROR + ': ' + validationErrors.array().map(error => error.msg).join(', ') });
        }
        if (req.body === undefined || req.body.phone === undefined || req.body.entryId === undefined) {
            return res.status(400).json({ msg: message_1.message.NO_INPUT });
        }
        const entryIdCorrect = yield winner_1.default.entryExist(req.body.entryId);
        if (!entryIdCorrect) {
            return res.status(400).json({
                msg: message_1.message.WRONG_ENTRY_ID
            });
        }
        const alreadyRedeemed = yield winner_1.default.isRedeemed(req.body.entryId);
        if (alreadyRedeemed) {
            return res.status(400).json({
                msg: message_1.message.ALREADY_REDEEMED
            });
        }
        yield winner_1.default.redeemPrize(req.body.entryId, req.body.phone);
        res.status(200).json({
            msg: message_1.message.WAIT_FOR_SMS
        });
    });
}
exports.actionRedeem = actionRedeem;
function actionDraw(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // check customer id
        // super simplified version
        if (req.headers.authorization === undefined) {
            return res.status(401).json({
                msg: 'Unauthorized'
            });
        }
        const customerId = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : '';
        if (yield winner_1.default.customerPlayedToday(customerId)) {
            return res.status(400).json({
                msg: message_1.message.JOIN_TMR
            });
        }
        const randomNum = Math.random();
        const allPrizes = (yield prize_1.default.getAll());
        let result = null;
        // sort by ascending first
        const defaultPrize = allPrizes.find(prize => prize.isDefault);
        if (defaultPrize === undefined || defaultPrize === null) {
            return res.status(400).json({
                msg: message_1.message.NOT_INIT
            });
        }
        const prizes = allPrizes.filter(prize => !prize.isDefault).sort((a, b) => {
            return (a === null || a === void 0 ? void 0 : a.odds) - (b === null || b === void 0 ? void 0 : b.odds);
        });
        let prevOddsSum = 0;
        for (const prize of prizes) {
            if (randomNum < prize.odds + prevOddsSum) {
                prevOddsSum += prize.odds;
                result = yield getPrize(customerId, prize, defaultPrize);
                break;
            }
        }
        if (result == null) {
            result = yield getPrize(customerId, defaultPrize, undefined);
        }
        if (result != null) {
            return res.json({
                msg: `You win '${result.prize.name}'!`,
                entryId: result.entryId
            });
        }
        else {
            return res.json('error');
        }
    });
}
exports.actionDraw = actionDraw;
