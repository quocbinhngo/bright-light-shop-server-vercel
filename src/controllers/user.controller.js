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
exports.addBalanceHandler = exports.createAdminAccountHandler = exports.getCustomerByIdHandler = exports.searchCustomersHandler = exports.getCustomershandler = exports.createCustomerAccountHandler = exports.updateUserHandler = exports.getUserHandler = void 0;
const lodash_1 = require("lodash");
const user_service_1 = require("../services/user.service");
function getUserHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = res.locals.user;
            return res.status(200).json(user);
        }
        catch (error) { }
    });
}
exports.getUserHandler = getUserHandler;
function updateUserHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = res.locals.user;
            const { firstName, lastName, phone, address } = req.body;
            const updatedUser = (yield (0, user_service_1.updateUser)({ _id: user._id }, { firstName, lastName, phone, address }));
            return res.status(200).json((0, user_service_1.getUserResponse)(updatedUser));
        }
        catch (error) {
            return res.status(500).json("Cannot update user");
        }
    });
}
exports.updateUserHandler = updateUserHandler;
function createCustomerAccountHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName, address, phone, username, password } = req.body;
            if (yield (0, user_service_1.findUser)({ username })) {
                return res.status(400).json("Username is already exists");
            }
            const hashedPassword = yield (0, user_service_1.hashPassword)(password);
            const customerCode = ((yield (0, user_service_1.getMaxCustomerCode)()) || 0) + 1;
            const user = yield (0, user_service_1.createUser)({
                customerCode,
                firstName,
                lastName,
                address,
                phone,
                username,
                password: hashedPassword,
                accountType: "guest",
            });
            const userResponse = (0, user_service_1.getUserResponse)(user);
            return res.status(201).json(userResponse);
        }
        catch (error) {
            return res.status(500).json("Cannot create customer account");
        }
    });
}
exports.createCustomerAccountHandler = createCustomerAccountHandler;
function getCustomershandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { accountType, desc } = req.query;
        const sortBy = req.query.sortBy;
        const sort = { [sortBy]: desc ? -1 : 1 };
        let customers;
        if (!accountType) {
            customers = yield (0, user_service_1.findUsers)({ accountType: { $ne: "admin" } }, { sort });
        }
        else {
            customers = yield (0, user_service_1.findUsers)({ accountType }, { sort });
        }
        return res.status(200).json(customers);
    });
}
exports.getCustomershandler = getCustomershandler;
function searchCustomersHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const search = req.query.search.toLowerCase();
        const allCustomers = yield (0, user_service_1.findUsers)({ accountType: { $ne: "admin" } });
        if (search === "") {
            const customersResponse = yield Promise.all(allCustomers.map((customer) => __awaiter(this, void 0, void 0, function* () { return (0, user_service_1.getUserResponse)(customer); })));
            return res.status(200).json(customersResponse);
        }
        const customers = allCustomers.filter((customer) => (0, user_service_1.getUserFullName)(customer) === search ||
            (0, user_service_1.getUserIdentifier)(customer) === search);
        allCustomers.forEach(customer => console.log((0, user_service_1.getUserIdentifier)(customer)));
        const customersResponse = yield Promise.all(customers.map((customer) => __awaiter(this, void 0, void 0, function* () { return (0, user_service_1.getUserResponse)(customer); })));
        return res.status(200).json(customersResponse);
    });
}
exports.searchCustomersHandler = searchCustomersHandler;
function getCustomerByIdHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const customer = yield (0, user_service_1.findUser)({ _id: id });
        if (!customer || customer.accountType === "admin") {
            return res.status(400).json("Customer does not exist");
        }
        return res.status(200).json(customer);
    });
}
exports.getCustomerByIdHandler = getCustomerByIdHandler;
function createAdminAccountHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName, address, phone, username, password } = req.body;
            if (yield (0, user_service_1.findUser)({ username })) {
                return res.status(400).json("Username is already exists");
            }
            const hashedPassword = yield (0, user_service_1.hashPassword)(password);
            const user = yield (0, user_service_1.createUser)({
                firstName,
                lastName,
                address,
                phone,
                username,
                password: hashedPassword,
                accountType: "admin",
            });
            const userResponse = (0, user_service_1.getUserResponse)(user);
            return res.status(201).json(userResponse);
        }
        catch (error) {
            return res.status(500).json("Cannot create admin account");
        }
    });
}
exports.createAdminAccountHandler = createAdminAccountHandler;
function addBalanceHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { amount } = req.body;
        const userId = (0, lodash_1.get)(req, "headers.user-id");
        const balance = (yield (0, user_service_1.findUser)({ _id: userId })).balance;
        const user = yield (0, user_service_1.updateUser)({ _id: userId }, { balance: balance + amount });
        const userResponse = (0, user_service_1.getUserResponse)(user);
        return res.status(200).json(userResponse);
    });
}
exports.addBalanceHandler = addBalanceHandler;
