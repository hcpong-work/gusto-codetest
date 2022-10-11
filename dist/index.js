"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prizeRouter = require('./routes/prizeRoute');
const app = (0, express_1.default)();
app.use(express_1.default.json());
// swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// route
app.use('/prizes', prizeRouter);
app.listen(process.env.PORT);
exports.default = app;
