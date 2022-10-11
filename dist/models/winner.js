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
const moment_1 = __importDefault(require("moment"));
const prismaHelper_1 = require("../utils/prismaHelper");
class Winner {
    constructor(customerId, phone, prize, createdAt, redeemedAt) {
        this.customerId = customerId !== null && customerId !== void 0 ? customerId : '';
        this.phone = phone !== null && phone !== void 0 ? phone : '';
        this.prize = prize;
        this.createdAt = (createdAt != null) ? createdAt : new Date();
        this.redeemedAt = redeemedAt;
    }
    static makeEntryId() {
        const length = 16;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    static duplicatedId(testId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = (yield prismaHelper_1.prisma.winner.count({
                where: {
                    customerId: {
                        equals: testId
                    }
                }
            }));
            return count > 0;
        });
    }
    static create(winner) {
        return __awaiter(this, void 0, void 0, function* () {
            let winnerUniqueId = '';
            while (true) {
                winnerUniqueId = Winner.makeEntryId();
                if (!(yield Winner.duplicatedId(winnerUniqueId))) {
                    break;
                }
            }
            try {
                yield prismaHelper_1.prisma.winner.create({
                    data: {
                        entryId: winnerUniqueId,
                        customerId: winner.customerId,
                        phone: winner.phone,
                        prizeId: winner.prize.id,
                        createdAt: winner.createdAt
                    }
                });
                winner.entryId = winnerUniqueId;
            }
            catch (e) {
                console.log(e);
                return null;
            }
            return winner;
        });
    }
    static deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaHelper_1.prisma.winner.deleteMany();
        });
    }
    static customerPlayedToday(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield prismaHelper_1.prisma.winner.count({
                where: {
                    customerId,
                    createdAt: {
                        gte: (0, moment_1.default)().startOf('day').toDate(),
                        lte: (0, moment_1.default)().toDate()
                    }
                }
            });
            return result > 0;
        });
    }
    static entryExist(entryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield prismaHelper_1.prisma.winner.count({
                where: {
                    entryId
                }
            })) > 0);
        });
    }
    static redeemPrize(entryId, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaHelper_1.prisma.winner.updateMany({
                where: {
                    entryId,
                    redeemedAt: null
                },
                data: {
                    phone,
                    redeemedAt: (0, moment_1.default)().toDate()
                }
            });
        });
    }
    static isRedeemed(entryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield prismaHelper_1.prisma.winner.count({
                where: {
                    entryId,
                    redeemedAt: {
                        not: null
                    }
                }
            })) > 0);
        });
    }
    static countWinner(prize) {
        return __awaiter(this, void 0, void 0, function* () {
            const allWinners = yield prismaHelper_1.prisma.winner.findMany({
                where: {
                    prizeId: prize.id
                }
            });
            if (allWinners != null) {
                return {
                    winnerDaily: allWinners.filter((winner) => {
                        if (winner != null) {
                            return (0, moment_1.default)(winner.createdAt).isSame((0, moment_1.default)(), 'date');
                        }
                        else {
                            return false;
                        }
                    }).length,
                    winnerTotal: allWinners.length
                };
            }
            else {
                return {
                    winnerDaily: 0,
                    winnerTotal: 0
                };
            }
        });
    }
}
exports.default = Winner;
