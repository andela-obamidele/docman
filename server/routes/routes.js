import express from 'express';

import userController from '../controllers/userController';
import documentController from '../controllers/documentController';
import authorizationChecker from '../middlewares/authorization';

const router = express.Router();

router.post('/users/login', userController.loginUser);

router.post('/users/', userController.signupUser);
router.use(authorizationChecker);
router.get('/users/', userController.getUsers);

router.put('/users/:id', (req, res) => {
  res.send({
    endpoint: '/users/:id',
    explain: 'updates user attributes'
  });
});

router.delete('/users/:id', userController.deleteUser);

router.post('/documents/', documentController.createDocument);

router.get('/documents/', documentController.getDocument);

router.put('/documents/:id', documentController.updateDocument);

router.delete('/documents/:id', documentController.deleteDocument);

router.get('/users/:id/documents', documentController.getUserDocuments);

router.get('/search/users/', userController.searchUser);

router.get('/search/documents/', documentController.searchDocuments);

export default router;
