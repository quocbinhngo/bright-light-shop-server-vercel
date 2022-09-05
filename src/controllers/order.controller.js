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
exports.returnOrderHandler = exports.getAllOrdersHandler = exports.createOrderWithRewardPointHandler = exports.createOrderHandler = void 0;
const lodash_1 = require("lodash");
const order_service_1 = require("../services/order.service");
const user_service_1 = require("../services/user.service");
function createOrderHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const customerId = (0, lodash_1.get)(req, "headers.user-id");
        const { orderDetails, rentalDuration } = req.body;
        const customer = yield (0, user_service_1.findUser)({ _id: customerId });
        if (!customer || customer.accountType === "admin") {
            return res.status(403).json("You are not authenticated");
        }
        // Check whether the guest make 2 day ren
        if (customer.accountType === "guest" && rentalDuration === 2) {
            return res.status(403).json("Guest account cannot make 2-day rental");
        }
        // Check whether duplicate item
        if ((0, order_service_1.checkDuplicateItem)(orderDetails)) {
            return res.status(400).json("You make a duplicate item selection");
        }
        // Check whether the item is available or not
        const orderDetailsWithItem = yield (0, order_service_1.getOrderDetailsWithItem)(orderDetails);
        if (!orderDetailsWithItem) {
            return res.status(400).json("Item is not available");
        }
        if (typeof orderDetailsWithItem === "string") {
            return res.status(400).json(orderDetailsWithItem);
        }
        if (!(yield (0, order_service_1.processOrder)(orderDetailsWithItem, customer))) {
            return res
                .status(400)
                .json("Your balance is not enough for creating order");
        }
        yield (0, order_service_1.createOrder)({ orderDetails, rentalDuration, customerId });
        const newRewardPoint = yield (0, order_service_1.saveRewardPoint)(customerId, orderDetails);
        if (!newRewardPoint) {
            return res.status(201).json("Create order successfully");
        }
        return res
            .status(201)
            .json(`Create order successfully. Your current reward points now is ${newRewardPoint}`);
    });
}
exports.createOrderHandler = createOrderHandler;
function createOrderWithRewardPointHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const customerId = (0, lodash_1.get)(req, "headers.user-id");
        const { orderDetails, rentalDuration } = req.body;
        const customer = yield (0, user_service_1.findUser)({ _id: customerId });
        if (!customer || customer.accountType !== "vip") {
            return res.status(403).json("You are not authenticated");
        }
        // Check whether the item is available or not
        const orderDetailsWithItem = yield (0, order_service_1.getOrderDetailsWithItem)(orderDetails);
        if (!orderDetailsWithItem) {
            return res.status(400).json("Item is not available");
        }
        if (typeof orderDetailsWithItem === "string") {
            return res.status(400).json(orderDetailsWithItem);
        }
        if (!(yield (0, order_service_1.processOrder)(orderDetailsWithItem, customer, true))) {
            return res
                .status(400)
                .json("Your reward point is not enough for creating order");
        }
        yield (0, order_service_1.createOrder)({ orderDetails, rentalDuration, customerId });
        const rewardPoint = (yield (0, user_service_1.findUser)({ _id: customerId }))
            .rewardPoint;
        return res
            .status(201)
            .json(`Create order successfully. Your current reward points now is ${rewardPoint}`);
    });
}
exports.createOrderWithRewardPointHandler = createOrderWithRewardPointHandler;
function getAllOrdersHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = res.locals.user;
        const orders = yield (0, order_service_1.findOrders)({ customerId: user._id });
        const ordersResponse = yield Promise.all(orders.map((order) => __awaiter(this, void 0, void 0, function* () { return yield (0, order_service_1.getOrderResponse)(order); })));
        return res.status(200).json(ordersResponse);
    });
}
exports.getAllOrdersHandler = getAllOrdersHandler;
function returnOrderHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { orderId } = req.params;
        const userId = (0, lodash_1.get)(req, "headers.user-id");
        const order = yield (0, order_service_1.findOrder)({ _id: orderId, customerId: userId });
        if (!order) {
            return res.status(400).json("You do not have this order");
        }
        const isOntime = yield (0, order_service_1.returnOrder)(orderId, userId);
        if (!isOntime) {
            const balance = (yield (0, user_service_1.findUser)({ _id: userId })).balance;
            return res
                .status(200)
                .json(`Return order late. You are fine with $10. Now your balance is ${balance}`);
        }
        return res.status(200).json("Return order on time. Thank you for renting");
    });
}
exports.returnOrderHandler = returnOrderHandler;
