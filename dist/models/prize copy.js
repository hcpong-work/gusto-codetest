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
Object.defineProperty(exports, "__esModule", { value: true });
const prismaHelper_1 = require("../utils/prismaHelper");
class Prize {
    constructor(id, name, total, daily, odds) {
        this.id = id;
        this.name = name;
        this.total = total;
        this.daily = daily;
        this.odds = odds;
    }
    static create(prize) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaHelper_1.prisma.prize.create({
                data: {
                    id: prize.id,
                    name: prize.name,
                    total: prize.total,
                    daily: prize.daily,
                    odds: prize.odds,
                }
            });
        });
    }
    static deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaHelper_1.prisma.prize.deleteMany();
        });
    }
}
exports.default = Prize;
