"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = void 0;
const categories = [
    {
        id: '5_dollar_cash_coupon',
        name: '$5 Cash Coupon',
        daily: 4,
        total: 20,
        odds: 0.5 / 100,
        isDefault: false
    },
    {
        id: '2_dollar_cash_coupon',
        name: '$2 Cash Coupon',
        daily: 10,
        total: 50,
        odds: 2 / 100,
        isDefault: false
    },
    {
        id: 'coupon_buy_1_get_1_free',
        name: 'Buy 1 Get 1 Free Coupon',
        daily: 50,
        total: 500,
        odds: 80 / 100,
        isDefault: false
    },
    {
        id: 'no_prize',
        name: 'No Prize',
        daily: 0,
        total: 0,
        odds: 17.5 / 100,
        isDefault: true
    }
];
exports.categories = categories;
