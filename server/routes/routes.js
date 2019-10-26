import express from 'express';
import UserController from '../controllers/UserController';
import DocumentController from '../controllers/DocumentController';
import authorizationChecker from '../middlewares/authorization';
import deleteDocAuthorization from '../middlewares/deleteDocumentAuthorization';
import deleteUserAuthorization from '../middlewares/deleteUserAuthorization';
import idParameterValidator from '../middlewares/idParameterValidator';
import limitAndOffsetValidator from '../middlewares/limitOffsetValidator';
import searchValidator from '../middlewares/searchValidator';

const router = express.Router();
router.post('/users/login', UserController.loginUser);
router.post('/users/', UserController.signupUser);
router.use('/', authorizationChecker);
router.get('/users/', limitAndOffsetValidator, UserController.getUsers);
router.get('/users/:id/', idParameterValidator, UserController.getUserById);
router.put('/users/:id', idParameterValidator, UserController.updateUserInfo);
router
  .delete(
    '/users/:id',
    [idParameterValidator, deleteUserAuthorization],
    UserController.deleteUser);
router.post('/documents/', DocumentController.createDocument);
router
  .get(
    '/documents/',
    limitAndOffsetValidator,
    DocumentController.getDocuments);
router
  .get('/documents/:id', idParameterValidator, DocumentController.getDocument);
router
  .put(
    '/documents/:id',
    idParameterValidator,
    DocumentController.updateDocument);
router.delete(
  '/documents/:id',
  deleteDocAuthorization,
  DocumentController.deleteDocument);
router
  .get(
    '/users/:id/documents',
    idParameterValidator,
    DocumentController.getUserDocuments);
router.get('/search/users/', searchValidator, UserController.searchUser);
router
  .get('/search/documents/',
    searchValidator,
    DocumentController.searchDocuments);

export default router;
