import express from 'express';
const router = express.Router();
import { signup, confirmAccount, login, forgotPassword, resetPassword } from '../controllers/user.controller.js';

router.route('/register').post(signup);
router.route('/confirm/:token').get(confirmAccount);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword').post(resetPassword);

export default router;