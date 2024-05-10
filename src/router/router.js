"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("../Controller/controller");
const router = express_1.default.Router();
// router.post('/login',signIn)
router.post('/signup', controller_1.signUp);
router.post('/verifyotp', controller_1.verifyOtp);
router.post('/signin', controller_1.signIn);
router.post('/addnote', controller_1.addNote);
router.get('/allnotes', controller_1.getNotes);
router.get('/singleNote', controller_1.getSingleNote);
router.put('/editnote', controller_1.editNote);
router.put('/trashnote', controller_1.trashNote);
router.put('/restorenote', controller_1.restoreNote);
router.delete('/deletenote', controller_1.deleteNote);
exports.default = router;
