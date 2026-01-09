"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const adminAuth_1 = __importDefault(require("../middleware/adminAuth"));
const router = (0, express_1.Router)();
router.get('/', eventController_1.getEvents);
router.post('/', adminAuth_1.default, eventController_1.createEvent);
router.get('/:id', eventController_1.getEventById);
router.post('/:id/gifts', adminAuth_1.default, eventController_1.addGift);
router.delete('/:id/gifts/:giftId', adminAuth_1.default, eventController_1.deleteGift);
router.post('/:id/participants', adminAuth_1.default, eventController_1.addParticipants);
exports.default = router;
