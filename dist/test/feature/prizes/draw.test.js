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
const prismaHelper_1 = require("../../../utils/prismaHelper");
const data_1 = require("../../../data/data");
const prize_1 = __importDefault(require("../../../models/prize"));
const supertest_1 = __importDefault(require("supertest"));
const baseURL = 'http://localhost';
describe('Given default prizes', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // reset db
        yield prismaHelper_1.prisma.winner.deleteMany();
        yield prismaHelper_1.prisma.prize.deleteMany();
        // GIVEN
        const cats = data_1.categories;
        yield prismaHelper_1.prisma.prize.createMany({
            data: cats
        });
    }));
    test('Should return 200 WHEN not played', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId);
        // THEN
        expect(apiResponse.status).toBe(200);
    }));
    test('Should return 200 WHEN not played, but other players played', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const prize = yield getFirstPrize();
        const now = new Date();
        yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId: customerId + '5',
                prizeId: prize.id,
                createdAt: now,
                phone: ''
            }
        });
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId);
        // THEN
        expect(apiResponse.status).toBe(200);
    }));
    test('Should return 200 WHEN not played today, but played 1 day before', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const prize = yield getFirstPrize();
        const now = new Date();
        now.setDate(now.getDate() - 1);
        yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: now,
                phone: ''
            }
        });
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId);
        // THEN
        expect(apiResponse.status).toBe(200);
    }));
    test('Should return 400 WHEN already played today', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const prize = yield getFirstPrize();
        const now = new Date();
        now.setMinutes(now.getMinutes() - 1);
        yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: now,
                phone: ''
            }
        });
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId);
        // THEN
        expect(apiResponse.status).toBe(400);
    }));
    test('Should return 401 WHEN no header provided', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const prize = yield getFirstPrize();
        const now = new Date();
        now.setMinutes(now.getMinutes() - 1);
        yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: now,
                phone: ''
            }
        });
        const apiResponse = yield (0, supertest_1.default)(baseURL).post('/prizes/draw');
        // THEN
        expect(apiResponse.status).toBe(401);
    }));
    test('Should return different entryId WHEN draw twice', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId1 = '1';
        const customerId2 = '2';
        const apiResponse1 = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId1);
        const apiResponse2 = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId2);
        // THEN
        expect(apiResponse1.body.entryId).not.toBe(apiResponse2.body.entryId);
    }));
});
describe('Given no prize', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // reset db
        yield prismaHelper_1.prisma.winner.deleteMany();
        yield prismaHelper_1.prisma.prize.deleteMany();
        // GIVEN
        // no prize
    }));
    test('Should return 400 WHEN draw with customerId', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId);
        // THEN
        expect(apiResponse.status).toBe(400);
    }));
    test('Should return 401 WHEN draw without customerId', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const apiResponse = yield (0, supertest_1.default)(baseURL).post('/prizes/draw');
        // THEN
        expect(apiResponse.status).toBe(401);
    }));
});
describe('Given limited prizes', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // reset db
        yield prismaHelper_1.prisma.winner.deleteMany();
        yield prismaHelper_1.prisma.prize.deleteMany();
        // GIVEN
        yield prismaHelper_1.prisma.prize.createMany({
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
        });
    }));
    test('Should draw limited prize WHEN within quota ', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId);
        // THEN
        const winner = yield prismaHelper_1.prisma.winner.findFirst();
        expect(apiResponse.status).toBe(200);
        expect(winner === null || winner === void 0 ? void 0 : winner.prizeId).toBe('limited');
    }));
    test('Should not draw limited prize WHEN over quota ', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const customerId = '1234';
        const apiResponse1 = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId + '1');
        const winner1 = yield prismaHelper_1.prisma.winner.findFirst({
            orderBy: {
                id: 'desc'
            }
        });
        const apiResponse2 = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/draw')
            .set('Authorization', customerId + '2');
        const winner2 = yield prismaHelper_1.prisma.winner.findFirst({
            orderBy: {
                id: 'desc'
            }
        });
        // THEN
        expect(apiResponse1.status).toBe(200);
        expect(apiResponse2.status).toBe(200);
        expect(winner1 === null || winner1 === void 0 ? void 0 : winner1.prizeId).toBe('limited');
        expect(winner2 === null || winner2 === void 0 ? void 0 : winner2.prizeId).toBe('no_prize');
    }));
});
// Helper
function getFirstPrize() {
    return __awaiter(this, void 0, void 0, function* () {
        const _prize = yield prismaHelper_1.prisma.prize.findFirst();
        if (_prize === null) {
            throw Error('error');
        }
        const prize = new prize_1.default(_prize.id, _prize.name, _prize.total, _prize.daily, _prize.odds.toNumber(), _prize.isDefault);
        return prize;
    });
}
