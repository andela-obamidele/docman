import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { assert } from 'chai';
import server from '../../server/server';
import { User, Document } from '../../server/models';
import errorConstants from '../../server/constants/errorConstants';
import dummyUsers from '../dummyData/dummyUsers';
import dummyAdmins from '../dummyData/dummyAdmins';

const request = supertest(server);

describe('GET /api/v1/users/:id/documents', () => {
  const dummyUser1 = dummyUsers[0];
  const dummyAdmin = dummyAdmins[0];
  let adminAuthorizationToken;
  let user1AuthorizationToken;
  before(() => Document
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true })
    )
    .then(() => User.bulkCreate(dummyAdmins))
    .then(() => request
      .post('/api/v1/users/login')
      .send({
        email: dummyAdmin.email,
        password: 'password'
      })
      .expect(200)
      .then((response) => {
        adminAuthorizationToken = response.body.token;
      }))
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUser1,
        confirmationPassword: dummyUser1.password
      })
      .expect(201)
      .then((response) => {
        user1AuthorizationToken = response.body.token;
      }))
    .then(() => request
      .get('/api/v1/users/')
      .set('Authorization', adminAuthorizationToken)
      .expect(200)
    )
  );
  it('should not get private files of other users for  admins', () => request
    .post('/api/v1/documents')
    .send({
      title: 'user document',
      content: 'this is a user doc',
      access: 'private'
    })
    .set('Authorization', user1AuthorizationToken)
    .expect(201)
    .then(() => {
      const currentUser = jwt
        .decode(adminAuthorizationToken.split(' ')[1]);
      return request
        .get(`/api/v1/users/${currentUser.data.id}/documents`)
        .set('Authorization', adminAuthorizationToken)
        .expect(404)
        .expect((response) => {
          assert
            .equal(response.body.error, errorConstants.noDocumentFoundError);
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
      .set('Authorization', adminAuthorizationToken)
      .expect(201)
      .then(() => {
        const user = jwt.decode(adminAuthorizationToken.split(' ')[1]);
        return request
          .get(`/api/v1/users/${user.data.id}/documents`)
          .set('Authorization', user1AuthorizationToken)
          .expect(404)
          .expect((response) => {
            assert.equal(response.body.error, 'no document found');
          });
      }));

  it(`should get all the documents of the currently 
  logged in user`, () => request
      .post('/api/v1/documents')
      .send({
        title: 'user roles tile',
        content: 'user role content',
        access: 'role'
      })
      .set('Authorization', user1AuthorizationToken)
      .expect(201)
      .then(() => request
        .post('/api/v1/documents')
        .send({
          title: 'user 1 public document',
          content: 'user 1 pubic content',
          access: 'public'
        })
        .set('Authorization', user1AuthorizationToken)
        .expect(201))
      .then(() => {
        const user = jwt.decode(user1AuthorizationToken.split(' ')[1]);
        return request
          .get(`/api/v1/users/${user.data.id}/documents`)
          .set('Authorization', user1AuthorizationToken)
          .expect(200)
          .expect((response) => {
            const docs = response.body.documents;
            assert.typeOf(docs, 'Array');
            assert.lengthOf(docs, 3);
          });
      }));
});
