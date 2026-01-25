import { Router } from 'express'
const router = Router()

import * as UserFeedController from '../controllers/userFeed.Controller.js'
import UserAuth from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/feed/create-one/feed').post(UserAuth, UserFeedController.createFeedForUser);
router.route('/feed/create-selected/feed').post(UserAuth, UserFeedController.createFeedForSelectedUsers);
router.route('/feed/create-all/feed').post(UserAuth, UserFeedController.createFeedForAllUsers);

// GET ROUTES
router.route('/user/feed').get(UserAuth, UserFeedController.getMyFeeds);

// PUT ROUTES

// DELETE ROUTES
router.route('/user/feed/:id').delete(UserAuth, UserFeedController.deleteFeed);

export default router;