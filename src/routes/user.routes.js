import { Router } from 'express'
const router = Router()

import * as UsersController from '../controllers/user.Controller.js'
import UserAuth from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/registerUser').post(UsersController.registerUser);

router.route('/loginUserWithEmailPassword').post(UsersController.loginUserWithEmailPassword);

router.route('/sendLoginOtp').post(UsersController.sendLoginOtp);
router.route('/verifyLoginOtp').post(UsersController.verifyLoginOtp);

router.route('/sendForgotPasswordOtp').post(UsersController.sendForgotPasswordOtp);
router.route('/verifyForgotPasswordOtp').post(UsersController.verifyForgotPasswordOtp);
router.route('/resetPassword').post(UserAuth, UsersController.resetPassword);

// GET ROUTES
router.route('/getUser').get(UserAuth, UsersController.getUser);
router.route('/profile').get(UserAuth, UsersController.getUserProfile);

// PUT ROUTES
router.route('/profile/update').put(UserAuth, UsersController.updateUserProfile);

// GET ROUTES
router.route('/verify-email').get(UsersController.verifyEmail);
router.route('/resend-verification-email').post(UsersController.resendVerificationEmail);
router.route('/unsubscribe').post(UsersController.unsubscribeUser);

// DELETE ROUTES

export default router;