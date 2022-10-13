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
const supertest_1 = __importDefault(require("supertest"));
const baseURL = 'http://localhost';
describe('Given prizes', () => {
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
    test('Should reset prizes WHEN no input', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const apiResponse = yield (0, supertest_1.default)(baseURL).post('/prizes/setup');
        // THEN
        const dbCount = yield prismaHelper_1.prisma.prize.count();
        expect(apiResponse.status).toBe(200);
        expect(dbCount).toBe(data_1.categories.length);
    }));
    test('Should set prizes WHEN got input', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/setup')
            .send({
            categories: [
                {
                    id: 'prize_1',
                    name: 'Prize #1',
                    daily: -1,
                    total: -1,
                    odds: -1,
                    isDefault: true
                }
            ]
        })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        // THEN
        const dbCount = yield prismaHelper_1.prisma.prize.count();
        expect(apiResponse.status).toBe(200);
        expect(dbCount).toBe(1);
    }));
    test('Should return 500 WHEN got invalid input', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/setup')
            .send({
            categories: []
        })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        // THEN
        expect(apiResponse.status).toBe(500);
    }));
});
describe('Given no prizes', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // reset db
        yield prismaHelper_1.prisma.winner.deleteMany();
        yield prismaHelper_1.prisma.prize.deleteMany();
        // GIVEN
        // no prize
    }));
    test('Should reset prizes WHEN no input', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const apiResponse = yield (0, supertest_1.default)(baseURL).post('/prizes/setup');
        // THEN
        const dbCount = yield prismaHelper_1.prisma.prize.count();
        expect(apiResponse.status).toBe(200);
        expect(dbCount).toBe(data_1.categories.length);
    }));
    test('Should set prizes WHEN got input', () => __awaiter(void 0, void 0, void 0, function* () {
        // WHEN
        const apiResponse = yield (0, supertest_1.default)(baseURL)
            .post('/prizes/setup')
            .send({
            categories: [
                {
                    id: 'prize_1',
                    name: 'Prize #1',
                    daily: -1,
                    total: -1,
                    odds: -1,
                    isDefault: true
                }
            ]
        })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        // THEN
        const dbCount = yield prismaHelper_1.prisma.prize.count();
        expect(apiResponse.status).toBe(200);
        expect(dbCount).toBe(1);
    }));
});
