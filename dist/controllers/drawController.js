"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionDraw = void 0;
const data_1 = require("../data/data");
function getPrize(prize) {
    console.log(prize);
    return prize;
}
function actionDraw(req, res) {
    const randomNum = Math.random();
    let result = null;
    // sort by ascending first
    const prizes = data_1.categories.sort((a, b) => {
        return a.odds - b.odds;
    });
    let prevOddsSum = 0;
    for (const prize of prizes) {
        console.log(randomNum, prize.odds + prevOddsSum);
        if (randomNum < prize.odds + prevOddsSum && prize.daily > 0 && prize.total > 0) {
            prevOddsSum += prize.odds;
            result = getPrize(prize);
            break;
        }
    }
    if (result) {
        res.json(result);
    }
    else {
        res.json('No Prize');
    }
}
exports.actionDraw = actionDraw;
