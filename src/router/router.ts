import express from "express"
import { addNote, editNote, getNotes, signIn, signUp, trashNote, verifyOtp ,restoreNote,deleteNote, getSingleNote, logout} from "../Controller/controller"
const router = express.Router()


// router.post('/login',signIn)
router.post('/signup',signUp)
router.post('/verifyotp',verifyOtp)
router.post('/signin',signIn)
router.post('/addnote',addNote)
router.get('/allnotes',getNotes)
router.get('/singleNote',getSingleNote)
router.put('/editnote',editNote)
router.put('/trashnote',trashNote)
router.put('/restorenote',restoreNote)
router.delete('/deletenote',deleteNote)
router.get('/logout',logout)
export default router