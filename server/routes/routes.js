import express from 'express';

import userController from '../controllers/userController';
import documentController from '../controllers/documentController';
import authorizationChecker from '../middlewares/authorization';
import deleteDocAuthorization from '../middlewares/deleteDocumentAuthorization';
import deleteUserAuthorization from '../middlewares/deleteUserAuthorization';
import idParameterValidator from '../middlewares/idParameterValidator';


const router = express.Router();
router.post('/users/login', userController.loginUser);
router.post('/users/', userController.signupUser);
router.use(authorizationChecker);
router.get('/users/', userController.getUsers);
router.get('/users/:id/', idParameterValidator, userController.getUserById);
router.put('/users/:id', idParameterValidator, userController.updateUserInfo);
router
  .delete(
    '/users/:id',
    [idParameterValidator, deleteUserAuthorization],
    userController.deleteUser);
router.post('/documents/', documentController.createDocument);
router.get('/documents/', documentController.getDocuments);
router
  .get('/documents/:id', idParameterValidator, documentController.getDocument);
router
  .put(
    '/documents/:id',
    idParameterValidator,
    documentController.updateDocument);
router.delete(
  '/documents/:id',
  deleteDocAuthorization,
  documentController.deleteDocument);
router
  .get(
    '/users/:id/documents',
    idParameterValidator,
    documentController.getUserDocuments);
router.get('/search/users/', userController.searchUser);
router.get('/search/documents/', documentController.searchDocuments);

export default router;
