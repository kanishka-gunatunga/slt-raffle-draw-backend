"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const raffleController_1 = require("../controllers/raffleController");
const router = (0, express_1.Router)();
router.post('/attendance/mark', raffleController_1.markAttendance);
router.get('/raffle/candidates', raffleController_1.getCandidates);
router.post('/raffle/record-winner', raffleController_1.recordWinner);
exports.default = router;
