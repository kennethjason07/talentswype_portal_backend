import { Router } from 'express'
const router = Router()

import * as PackageController from '../controllers/package.Controller.js'
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/category').post(UserAuth, allowRoles("ADMIN"), PackageController.createCategory);
router.route('/package').post(UserAuth, allowRoles("ADMIN"), PackageController.createPackage);
router.route('/package/purchase').post(UserAuth, PackageController.purchasePackage);

// GET ROUTES
router.route('/categories').get(UserAuth, PackageController.getAllCategories);
router.route('/categories/:id').get(UserAuth, PackageController.getCategoryById);
router.route('/packages').get(UserAuth, PackageController.getAllPackages);
router.route('/package/:id').get(UserAuth, PackageController.getPackageById);
router.route('/getCategoriesWithPackages').get(PackageController.getCategoriesWithPackages);
router.route('/package/purchase/active').get(UserAuth, PackageController.getActivePackage);
router.route('/package/purchase/history').get(UserAuth, PackageController.getPurchaseHistory);

// PUT ROUTES
router.route('/categories/:id').put(UserAuth, allowRoles("ADMIN"), PackageController.updateCategory);
router.route('/package/:id').put(UserAuth, allowRoles("ADMIN"), PackageController.updatePackage);

// DELETE ROUTES
router.route('/categories/:id').delete(UserAuth, allowRoles("ADMIN"), PackageController.deleteCategory);
router.route('/package/:id').delete(UserAuth, allowRoles("ADMIN"), PackageController.deletePackage);

export default router;