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
describe('Given drawn prizes', () => {
    const customerId = '1234';
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
    test('Should return 200 WHEN submit entryId and phone', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const prize = yield getFirstPrize();
        const winner = yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: new Date(),
                phone: ''
            }
        });
        const entryId = winner.entryId;
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/redeem')
            .send({
            entryId,
            phone: '97879787'
        })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        // THEN
        expect(apiResponse.status).toBe(200);
    }));
    test('Should return 400 WHEN submit invalid entryId and valid phone', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const prize = yield getFirstPrize();
        const winner = yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: new Date(),
                phone: ''
            }
        });
        const entryId = winner.entryId;
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/redeem')
            .send({
            entryId: entryId + 'error',
            phone: '97879787'
        })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        // THEN
        expect(apiResponse.status).toBe(400);
    }));
    test('Should return 400 WHEN submit valid entryId and invalid phone', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const prize = yield getFirstPrize();
        const winner = yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: new Date(),
                phone: ''
            }
        });
        const entryId = winner.entryId;
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/redeem')
            .send({
            entryId,
            phone: 'a97879787'
        })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        // THEN
        expect(apiResponse.status).toBe(400);
    }));
    test('Should return 400 WHEN submit invalid entryId and invalid phone', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const prize = yield getFirstPrize();
        const winner = yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: new Date(),
                phone: ''
            }
        });
        const entryId = winner.entryId;
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/redeem')
            .send({
            entryId: entryId + 'error',
            phone: '97879787' + 'error'
        })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        // THEN
        expect(apiResponse.status).toBe(400);
    }));
    test('Should return 400 WHEN submit empty body', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const prize = yield getFirstPrize();
        yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: new Date(),
                phone: ''
            }
        });
        const apiResponse = yield (0, supertest_1.default)(baseURL).post('/prizes/redeem');
        // THEN
        expect(apiResponse.status).toBe(400);
    }));
    test('Should return 400 WHEN already redeemed', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const prize = yield getFirstPrize();
        const winner = yield prismaHelper_1.prisma.winner.create({
            data: {
                entryId: '1234',
                customerId,
                prizeId: prize.id,
                createdAt: new Date(),
                phone: '',
                redeemedAt: new Date()
            }
        });
        const entryId = winner.entryId;
        const apiResponse = yield (0, supertest_1.default)(baseURL).post('/prizes/redeem').send({
            entryId,
            phone: '12345678'
        });
        // THEN
        expect(apiResponse.status).toBe(400);
    }));
});
describe('Given no drawn prize', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // reset db
        yield prismaHelper_1.prisma.winner.deleteMany();
        yield prismaHelper_1.prisma.prize.deleteMany();
        // GIVEN
        // no prize
    }));
    test('Should return 400', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const apiResponse = yield (0, supertest_1.default)(baseURL).post('/prizes/redeem').send({
            entryId: '1',
            phone: '12341234'
        });
        // THEN
        expect(apiResponse.status).toBe(400);
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
