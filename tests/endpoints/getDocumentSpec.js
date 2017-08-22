import supertest from 'supertest';
import { assert } from 'chai';
import server from '../../server/server';
import errorMessages from '../../server/constants/errors';
import dummyUsers from '../dummyData/dummyUsers';
import dummyAdmins from '../dummyData/dummyAdmins';
import { User, Document } from '../../server/models';

const request = supertest(server);

describe('GET /api/v1/documents/:id', () => {
  const admin = dummyAdmins[0];
  let adminAuthToken;
  let user1AuthToken;
  let user2AuthToken;
  let user1PrivateDocumentId;
  let user1RoleDocumentId;
  let adminRoleDocumentId;
  let admin2AuthToken;
  let user2PublicDocumentId;
  before(() => Document
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true })
    )
    .then(() => User.bulkCreate(dummyAdmins))
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
    .then(() => request
      .post('/api/v1/users/')
      .send({
        ...dummyUsers[1],
        confirmationPassword: dummyUsers[1].password
      })
      .expect(201)
      .then((response) => {
        user1AuthToken = response.body.token;
      }))
    .then(() => request
      .post('/api/v1/users/')
      .send({
        ...dummyUsers[0],
        confirmationPassword: dummyUsers[0].password
      })
      .expect(201)
      .then((response) => {
        user2AuthToken = response.body.token;
      }))
  );

  it('should not get user private documents for an admin', () => request
    .post('/api/v1/documents')
    .send({
      title: 'user document 1',
      content: 'user document 1 content',
      access: 'private'
    })
    .set('Authorization', user1AuthToken)
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
          errorMessages.fileQueryForbiddenError
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
          errorMessages.fileQueryForbiddenError);
      })
  );
  it('should get user private document for the user that owns it',
    () => request
      .get(`/api/v1/documents/${user1PrivateDocumentId}`)
      .set('Authorization', user1AuthToken)
      .expect(200)
      .expect((response) => {
        const doc = response.body.document;
        assert.equal(doc.id, user1PrivateDocumentId);
        assert.equal(doc.access, 'private');
        assert.equal(doc.role, 2);
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
    .set('Authorization', user1AuthToken)
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
        .set('Authorization', user1AuthToken)
        .expect(403)
        .expect((response) => {
          assert
            .equal(response.body.error, errorMessages.fileQueryForbiddenError);
        }))
  );

  it('should get admin document with role access for another admin',
    () => request
      .post('/api/v1/users/login')
      .send({
        ...dummyAdmins[1],
        confirmationPassword: dummyAdmins[1].password
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
  it('should get admin document with role access for the owner of the document',
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
      .set('Authorization', user1AuthToken)
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
