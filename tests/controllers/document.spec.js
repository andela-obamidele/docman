import { assert } from 'chai';
import supertest from 'supertest';
import jwtDriver from 'jsonwebtoken';
import { User, Document } from '../../server/models/';
import server from '../../server/server';
import DummyUsers from '../dummyData/DummyUsers';
import ErrorConstants from '../../server/constants/ErrorConstants';
import SuccessConstants from '../../server/constants/SuccessConstants';
import DummyAdmins from '../dummyData/DummyAdmins';


const request = supertest(server);
describe('Document controller', () => {
  const {
    invalidDocumentAccessLevel,
    duplicateDocTitleError
  } = ErrorConstants;
  const dummyUser = DummyUsers[0];
  const dummyUser2 = DummyUsers[1];
  const admin = DummyAdmins[0];

  let adminAuthToken;
  let admin2AuthToken;

  let userAuthToken;
  let user2AuthToken;
  let docToBeDeletedId;


  let user1PrivateDocumentId;
  let user1RoleDocumentId;
  let user2PublicDocumentId;
  let adminRoleDocumentId;
  const { email, password, username } = DummyUsers[0];
  const aUser = {
    email,
    password,
    username,
    confirmationPassword: password
  };

  before(() => User
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => Document.destroy(
      {
        where: {},
        cascade: true,
        restartIdentity: true
      }))
    .then(() => request
      .post('/api/v1/users/')
      .send(aUser)
      .expect(201)
      .then((response) => {
        userAuthToken = response.body.token;
      })
    )
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUser2,
        confirmationPassword: dummyUser2.password
      })
      .expect(201)
      .then((response) => {
        user2AuthToken = response.body.token;
      }))
    .then(() => User.bulkCreate(DummyAdmins))
    .then(() => request
      .post('/api/v1/users/login')
      .send({
        email: admin.email,
        password: 'password'
      })
      .expect(200)
      .then((response) => {
        adminAuthToken = response.body.token;
      }))
    .catch(error => error)
  );

  describe('Create document: POST /api/v1/documents/', () => {
    it('should respond with an error message when invalid access is specified',
      () => request
        .post('/api/v1/documents/')
        .send({
          title: 'some title',
          content: 'some content',
          access: 'sh*t'
        })
        .set('Authorization', userAuthToken)
        .expect(403)
        .expect((response) => {
          assert.equal(response.body.error, invalidDocumentAccessLevel);
        })
    );
    it('should respond with error message when there is a validation error',
      () => request
        .post('/api/v1/documents')
        .send({
          title: null,
          content: 'user public content',
          access: 'public'
        })
        .set('Authorization', userAuthToken)
        .expect(400)
        .expect((response) => {
          const error = response.body.error;
          assert
            .equal(
              error.message,
              'title cannot be empty'
            );
        }));
    // eslint-disable-next-line
    it('should respond with an array of errors multiple validation error occurs',
      () => request
        .post('/api/v1/documents')
        .send({
          title: null,
          content: null,
          access: 'public'
        })
        .set('Authorization', userAuthToken)
        .expect(400)
        .expect((response) => {
          const errors = response.body.errors;
          assert.typeOf(errors, 'Array');
          assert.lengthOf(errors, 2);
          assert.typeOf(errors[0].message, 'string');
          assert
            .equal(
              errors[0].message,
              'title cannot be empty'
            );
          assert
            .equal(
              errors[1].message,
              'content cannot be empty'
            );
        }));
    // eslint-disable-next-line
    it('should respond with the created user object when valid  payload is expected',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'some title',
          content: 'some content',
          access: 'public'
        })
        .set('Authorization', userAuthToken)
        .expect(201)
        .expect((response) => {
          const doc = response.body.document;
          const expectedAuthor = jwtDriver.decode(userAuthToken.split(' ')[1]);
          const expectedAuthorId = expectedAuthor.data.id;
          assert.equal(doc.title, 'some title');
          assert.equal(doc.content, 'some content');
          assert.equal(doc.access, 'public');
          assert.equal(doc.authorId, expectedAuthorId);
        })
    );
    // eslint-disable-next-line
    it('should respond with an error message  when documenttitle already exist in the database',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'some title',
          content: 'some content',
          access: 'public'
        })
        .set('Authorization', userAuthToken)
        .expect(409)
        .expect((response) => {
          const error = response.body.error;
          assert.equal(error, duplicateDocTitleError);
        })
    );
  });

  describe('Delete document: DELETE /api/v1/documents/:Id', () => {
    // eslint-disable-next-line
    it('should respond with an error message when user tries to delete document that does not exist', () => request
      .delete('/api/v1/documents/1')
      .set('Authorization', userAuthToken)
      .expect(404)
      .expect((response) => {
        const errorMessage = response.body.error;
        assert.equal(errorMessage, ErrorConstants.voidDocumentDeleteError);
      })
    );
    // eslint-disable-next-line
    it('should respond with an error message when user tries to delete document that does not belong to her', () => request
      .post('/api/v1/documents')
      .send({
        title: 'the title',
        content: 'the content',
        access: 'public'
      })
      .set('Authorization', user2AuthToken)
      .expect(201)
      .then((response) => {
        docToBeDeletedId = response.body.document.id;
      })
      .then(() => request
        .delete(`/api/v1/documents/${docToBeDeletedId}`)
        .set('Authorization', userAuthToken)
        .expect(403)
        .expect((response) => {
          const error = response.body.error;
          assert.equal(error, ErrorConstants.docDeleteUnauthorizedError);
        }))
    );
    // eslint-disable-next-line
    it('should respond with success message when user  deletes her own document',
      () => request
        .delete(`/api/v1/documents/${docToBeDeletedId}`)
        .set('Authorization', user2AuthToken)
        .expect(200)
        .expect((response) => {
          const successMessage = response.body.message;
          const expectedSuccessMessage = SuccessConstants
            .documentDeleteSuccessful;
          assert.equal(successMessage, expectedSuccessMessage);
        })
    );
  });

  describe('Get document: GET /api/v1/documents/:id', () => {
    it('should not get user private documents for an admin', () => request
      .post('/api/v1/documents')
      .send({
        title: 'user document 1',
        content: 'user document 1 content',
        access: 'private'
      })
      .set('Authorization', userAuthToken)
      .expect(201)
      .then((response) => {
        user1PrivateDocumentId = response.body.document.id;
      })
      .then(() => request
        .get(`/api/v1/documents/${user1PrivateDocumentId}`)
        .set('Authorization', adminAuthToken)
        .expect(403)
        .expect((response) => {
          assert.equal(
            response.body.error,
            ErrorConstants.fileQueryForbiddenError
          );
        }))
    );
    it('should not get private document of a user for other users',
      () => request
        .get(`/api/v1/documents/${user1PrivateDocumentId}`)
        .set('Authorization', user2AuthToken)
        .expect(403)
        .expect((response) => {
          assert.equal(
            response.body.error,
            ErrorConstants.fileQueryForbiddenError);
        })
    );
    it('should get user private document for the user that owns it',
      () => request
        .get(`/api/v1/documents/${user1PrivateDocumentId}`)
        .set('Authorization', userAuthToken)
        .expect(200)
        .expect((response) => {
          const doc = response.body.document;
          assert.equal(doc.id, user1PrivateDocumentId);
          assert.equal(doc.access, 'private');
          assert.equal(doc.title, 'user document 1');
          assert.equal(doc.content, 'user document 1 content');
        }));

    it('should get user document with role access for admins', () => request
      .post('/api/v1/documents/')
      .send({
        title: 'user role document',
        content: 'user role document content',
        access: 'role'
      })
      .set('Authorization', userAuthToken)
      .expect(201)
      .then((response) => {
        user1RoleDocumentId = response.body.document.id;
      })
      .then(() => request
        .get(`/api/v1/documents/${user1RoleDocumentId}`)
        .set('Authorization', adminAuthToken)
        .expect(200)
        .expect((response) => {
          const doc = response.body.document;
          assert.equal(doc.id, user1RoleDocumentId);
          assert.equal(doc.title, 'user role document');
          assert.equal(doc.access, 'role');
          assert.equal(doc.content, 'user role document content');
        }))
    );
    it('should get user document with role access for other users',
      () => request
        .get(`/api/v1/documents/${user1RoleDocumentId}`)
        .set('Authorization', user2AuthToken)
        .expect(200)
        .expect((response) => {
          const doc = response.body.document;
          assert.equal(doc.id, user1RoleDocumentId);
          assert.equal(doc.title, 'user role document');
          assert.equal(doc.access, 'role');
          assert.equal(doc.content, 'user role document content');
        })
    );
    it('should not get admin documents marked as role for normal users',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'admin role document',
          content: 'admin role document content',
          access: 'role'
        })
        .set('Authorization', adminAuthToken)
        .expect(201)
        .then((response) => {
          adminRoleDocumentId = response.body.document.id;
        })
        .then(() => request
          .get(`/api/v1/documents/${adminRoleDocumentId}`)
          .set('Authorization', userAuthToken)
          .expect(403)
          .expect((response) => {
            assert
              .equal(
                response.body.error,
                ErrorConstants.fileQueryForbiddenError);
          }))
    );

    it('should get admin document with role access for another admin',
      () => request
        .post('/api/v1/users/login')
        .send({
          ...DummyAdmins[1],
          confirmationPassword: DummyAdmins[1].password
        })
        .expect(200)
        .then((response) => {
          admin2AuthToken = response.body.token;
        })
        .then(() => request
          .get(`/api/v1/documents/${adminRoleDocumentId}`)
          .set('Authorization', admin2AuthToken)
          .expect(200)
          .expect((docResponse) => {
            const doc = docResponse.body.document;
            assert.equal(doc.id, adminRoleDocumentId);
            assert.equal(doc.title, 'admin role document');
            assert.equal(doc.content, 'admin role document content');
            assert.equal(doc.access, 'role');
          })
        )
    );
    it(`should get admin document with role access for the owner of 
    the document`,
      () => request
        .get(`/api/v1/documents/${adminRoleDocumentId}`)
        .set('Authorization', adminAuthToken)
        .expect(200)
        .expect((response) => {
          const doc = response.body.document;
          assert.equal(doc.id, adminRoleDocumentId);
          assert.equal(doc.title, 'admin role document');
          assert.equal(doc.content, 'admin role document content');
          assert.equal(doc.access, 'role');
        }));
    it('should get public document for admins',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'user 2 public document',
          content: 'user 2 public document content',
          access: 'public'
        })
        .set('Authorization', user2AuthToken)
        .expect(201)
        .then((response) => {
          user2PublicDocumentId = response.body.document.id;
        })
        .then(() => request
          .get(`/api/v1/documents/${user2PublicDocumentId}`)
          .set('Authorization', admin2AuthToken)
          .expect(200)
          .expect((response) => {
            const doc = response.body.document;
            assert.equal(doc.id, user2PublicDocumentId);
            assert.equal(doc.access, 'public');
            assert.equal(doc.title, 'user 2 public document');
            assert.equal(doc.content, 'user 2 public document content');
          })
        )
    );
    it('should get public document for users',
      () => request
        .get(`/api/v1/documents/${user2PublicDocumentId}`)
        .set('Authorization', userAuthToken)
        .expect(200)
        .expect((response) => {
          const doc = response.body.document;
          assert.equal(doc.id, user2PublicDocumentId);
          assert.equal(doc.access, 'public');
          assert.equal(doc.title, 'user 2 public document');
          assert.equal(doc.content, 'user 2 public document content');
        })
    );
  });
  describe('Get Documents: GET /api/v1/documents/', () => {
    before(() => Document
      .destroy({ where: {}, cascade: true, restartIdentity: true })
      .catch(error => error));

    it('should get an array of created documents when endpoint is reached',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'title',
          content: 'content',
          access: 'public'
        })
        .set('Authorization', userAuthToken)
        .expect(201)
        .then(() => request
          .get('/api/v1/documents')
          .set('Authorization', userAuthToken)
          .expect(200)
          .expect((response) => {
            assert.isArray(response.body.documents, true);
            const { title, content, access } = response.body.documents[0];
            assert.equal(title, 'title');
            assert.equal(content, 'content');
            assert.equal(access, 'public');
          })
        ));
    it('should not get private document of other users', () => request
      .post('/api/v1/documents')
      .send({
        title: 'some title',
        content: 'some content',
        access: 'private'
      })
      .set('Authorization', adminAuthToken)
      .expect(201)
      .then(() => request
        .get('/api/v1/documents')
        .set('Authorization', userAuthToken)
        .expect(200)
        .expect((response) => {
          const { documents } = response.body;
          assert.lengthOf(documents, 1);
          const { content, access, title } = documents[0];
          assert.notEqual(title, 'some title');
          assert.notEqual(content, 'some content');
          assert.notEqual(access, 'private');
          assert.equal(title, 'title');
          assert.equal(content, 'content');
          assert.equal(access, 'public');
        })
      )
    );
    // eslint-disable-next-line
    it('should not get document marked role that belongs to a user with higher role',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'admin secrete document',
          content: 'admn secrete content',
          access: 'role'
        })
        .set('Authorization', adminAuthToken)
        .expect(201)
        .then(() => request
          .get('/api/v1/documents')
          .set('Authorization', userAuthToken)
          .expect(200)
          .expect((response) => {
            const user = jwtDriver.decode(userAuthToken.split(' ')[1]).data;
            const documents = response.body.documents;
            const [doc] = documents;
            assert.lengthOf(documents, 1);
            assert.equal(doc.authorId, user.id);
          }))
    );
    // eslint-disable-next-line
    it('should respond with documents, counts and pages pageMetadata when limit and offset is provided as a queries',
      () => request
        .get('/api/v1/documents/?limit=2&offset=0')
        .set('Authorization', adminAuthToken)
        .expect(200)
        .expect((response) => {
          const { documents, count, pageMetadata } = response.body;
          assert.lengthOf(documents, 2);
          assert.equal(count, 3);
          assert.containsAllKeys(pageMetadata, [
            'totalCount',
            'currentPage',
            'pageCount',
            'pageSize']);
        })
    );
    it('should respond with page matadata when limit and offset is provided',
      () => request
        .get('/api/v1/documents/?limit=10&offset=10')
        .set('Authorization', adminAuthToken)
        .expect(404)
        .expect((response) => {
          const message = response.body.pageMetadata.message;
          assert.equal(message, ErrorConstants.endOfPageReached);
        })
    );
  });

  describe('Get user document: GET /api/v1/users/:id/documents', () => {
    before(() => Document
      .destroy({ where: {}, cascade: true, restartIdentity: true })
      .catch(error => error));

    it('should not get private files of other users for  admins',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'user document',
          content: 'this is a user doc',
          access: 'private'
        })
        .set('Authorization', userAuthToken)
        .expect(201)
        .then(() => {
          const currentUser = jwtDriver
            .decode(adminAuthToken.split(' ')[1]);
          return request
            .get(`/api/v1/users/${currentUser.data.id}/documents`)
            .set('Authorization', adminAuthToken)
            .expect(404)
            .expect((response) => {
              assert
                .equal(response
                  .body.error, ErrorConstants.noDocumentFoundError);
            });
        })
    );

    it(` should not get admin documents marked as role for normal 
    user`, () => request
        .post('/api/v1/documents')
        .send({
          content: 'this is the document content',
          title: 'this is the title',
          access: 'role',
        })
        .set('Authorization', adminAuthToken)
        .expect(201)
        .then(() => {
          const user = jwtDriver.decode(adminAuthToken.split(' ')[1]);
          return request
            .get(`/api/v1/users/${user.data.id}/documents`)
            .set('Authorization', userAuthToken)
            .expect(404)
            .expect((response) => {
              assert.equal(response.body.error, 'no document found');
            });
        }));

    it('should get all the documents of the currently logged in user',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'user roles tile',
          content: 'user role content',
          access: 'role'
        })
        .set('Authorization', userAuthToken)
        .expect(201)
        .then(() => request
          .post('/api/v1/documents')
          .send({
            title: 'user 1 public document',
            content: 'user 1 pubic content',
            access: 'public'
          })
          .set('Authorization', userAuthToken)
          .expect(201))
        .then(() => {
          const user = jwtDriver.decode(userAuthToken.split(' ')[1]);
          return request
            .get(`/api/v1/users/${user.data.id}/documents`)
            .set('Authorization', userAuthToken)
            .expect(200)
            .expect((response) => {
              const docs = response.body.documents;
              assert.typeOf(docs, 'Array');
              assert.lengthOf(docs, 3);
              assert.equal(docs[0].access, 'private');
              assert.equal(docs[0].authorId, user.data.id);
              assert.equal(docs[0].title, 'user document');
              assert.containsAllKeys(docs[0], ['createdAt', 'updatedAt', 'id']);
            });
        }));
  });

  describe('Search documents: GET /api/v1/documents/?q', () => {
    before(() => Document
      .destroy({ where: {}, cascade: true, restartIdentity: true }));
    // eslint-disable-next-line
    it('should respond with an error message when query string q is not provided',
      () => request
        .get('/api/v1/search/documents/?j=rubish')
        .set('Authorization', userAuthToken)
        .expect(400)
        .expect((response) => {
          assert.equal(response.body.error, ErrorConstants.emptySearchString);
        })
    );
    it('should not find private document of other users for admins',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'user private document',
          content: 'user private content',
          access: 'private'
        })
        .set('Authorization', userAuthToken)
        .expect(201)
        .then(() => request
          .get('/api/v1/search/documents/?q=private')
          .set('Authorization', adminAuthToken)
          .expect(404)
          .expect((response) => {
            assert
              .equal(response.body.error, ErrorConstants.noDocumentFoundError);
          })
        )
    );
    it('should not find private documents of a user for other users',
      () => request
        .get('/api/v1/search/documents/?q=private')
        .set('Authorization', user2AuthToken)
        .expect(404)
        .expect((response) => {
          assert
            .equal(response.body.error, ErrorConstants.noDocumentFoundError);
        })
    );
    it('should find private documents for the owner of the document',
      () => request
        .get('/api/v1/search/documents/?q=private')
        .set('Authorization', userAuthToken)
        .expect(200)
        .expect((response) => {
          const docs = response.body.documents;
          assert.typeOf(docs, 'Array');
          assert.lengthOf(docs, 1);
          const doc = docs.pop();
          assert.equal(doc.title, 'user private document');
          assert.equal(doc.content, 'user private content');
          assert.equal(doc.access, 'private');
        }));
    it('should find documents with role access for admins', () => request
      .post('/api/v1/documents')
      .send({
        title: 'user role document',
        content: 'user role content',
        access: 'role'
      })
      .set('Authorization', userAuthToken)
      .expect(201)
      .then(() => request
        .get('/api/v1/search/documents?q=role')
        .set('Authorization', adminAuthToken)
        .expect(200)
        .expect((response) => {
          const docs = response.body.documents;
          assert.typeOf(docs, 'Array');
          assert.lengthOf(docs, 1);
          const doc = docs.pop();
          assert.equal(doc.title, 'user role document');
          assert.equal(doc.content, 'user role content');
          assert.equal(doc.access, 'role');
        })
      ));
    it('should find user document of role access for other users', () => request
      .get('/api/v1/search/documents?q=role')
      .set('Authorization', user2AuthToken)
      .expect(200)
      .expect((response) => {
        const docs = response.body.documents;
        assert.typeOf(docs, 'Array');
        assert.lengthOf(docs, 1);
        const doc = docs.pop();
        assert.equal(doc.title, 'user role document');
        assert.equal(doc.content, 'user role content');
        assert.equal(doc.access, 'role');
      }));
    it('should get user document of role acess to document owner',
      () => request
        .get('/api/v1/search/documents?q=role')
        .set('Authorization', user2AuthToken)
        .expect(200)
        .expect((response) => {
          const docs = response.body.documents;
          assert.typeOf(docs, 'Array');
          assert.lengthOf(docs, 1);
          const doc = docs.pop();
          assert.equal(doc.title, 'user role document');
          assert.equal(doc.content, 'user role content');
          assert.equal(doc.access, 'role');
        }));
    it('should not find admin documents with role access for users',
      () => request
        .post('/api/v1/documents')
        .send({
          title: 'for the admins',
          content: 'content for admins only',
          access: 'role'
        })
        .set('Authorization', adminAuthToken)
        .expect(201)
        .then(() => request
          .get('/api/v1/search/documents/?q=for the admins')
          .set('Authorization', userAuthToken)
          .expect(404)
          .expect((response) => {
            assert
              .equal(
                response.body.error,
                ErrorConstants.noDocumentFoundError
              );
          })));
  });
  describe('Update document: PUT /api/v1/documents/:id', () => {
    let user1DocumentId;
    before(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true })
      .then(() => Document
        .destroy({ where: {}, cascade: true, restartIdentity: true })
      )
      .then(() => request
        .post('/api/v1/users')
        .send({
          ...dummyUser,
          confirmationPassword: dummyUser.password
        })
        .expect(201)
        .then((response) => {
          userAuthToken = response.body.token;
        })
      )
      .then(() => request
        .post('/api/v1/users')
        .send({
          ...dummyUser2,
          confirmationPassword: dummyUser2.password
        })
        .expect(201)
        .then((response) => {
          user2AuthToken = response.body.token;
        })
      )
      .catch(error => error)
    );
    // eslint-disable-next-line
    it('should respond with an error message when user do not provide all of the fields that is required to update', () => request
      .post('/api/v1/documents')
      .send({
        title: 'tdd',
        content: 'tdd is cool',
        access: 'public'
      })
      .set('Authorization', userAuthToken)
      .expect(201)
      .then((response) => {
        user1DocumentId = response.body.document.id;
      })
      .then(() => request
        .put(`/api/v1/documents/${user1DocumentId}`)
        .send({
        })
        .set('Authorization', userAuthToken)
        .expect(400)
        .expect((response) => {
          assert.equal(
            response.body.error,
            ErrorConstants.emptyDocumentUpdateError);
        })
      )
    );
    // eslint-disable-next-line
    it('should respond with an error message when a none number is provided as an id in parameters', () => request
      .put('/api/v1/documents/someranomebullsh*t')
      .send({})
      .set('Authorization', userAuthToken)
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, ErrorConstants.wrongIdTypeError);
      })
    );
    // eslint-disable-next-line
    it('should respond with an error message when access is updated with invalid type',
      () => request
        .put(`/api/v1/documents/${user1DocumentId}`)
        .send({ access: 'normal' })
        .set('Authorization', userAuthToken)
        .expect(403)
        .expect((response) => {
          assert.equal(
            response.body.error,
            ErrorConstants.invalidDocumentAccessLevel);
        }));
    // eslint-disable-next-line
    it('should respond with new updated data when legal payload is provided to the endpoint',
      () => request
        .put(`/api/v1/documents/${user1DocumentId}`)
        .send({ content: 'new content' })
        .set('Authorization', userAuthToken)
        .expect(200)
        .expect((response) => {
          const newDoc = response.body.document;
          assert.equal(newDoc.content, 'new content');
        }));
    // eslint-disable-next-line
    it('should not be able to update title with a title that is already used by someone else',
      () => request
        .post('/api/v1/documents/')
        .send({
          content: 'second user content',
          title: 'second user title',
          access: 'public'
        })
        .set('Authorization', user2AuthToken)
        .expect(201)
        .then(() => request
          .put(`/api/v1/documents/${user1DocumentId}`)
          .send({ title: 'second user title' })
          .set('Authorization', userAuthToken)
          .expect(400)
          .expect((response) => {
            const errorMessage = response.body.error.message;
            assert
              .equal(errorMessage, 'a document already exist with that title');
          })
        )
    );
  });
});
