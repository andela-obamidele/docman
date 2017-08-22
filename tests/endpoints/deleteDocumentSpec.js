import { assert } from 'chai';
import supertest from 'supertest';
import { User, Document } from '../../server/models';
import errorMessages from '../../server/constants/errors';
import successMessages from '../../server/constants/successes';
import server from '../../server/server';
import dummyUsers from '../dummyData/dummyUsers';

const request = supertest(server);

describe('DELETE /api/v1/documents/:Id', () => {
  const dummyUser = dummyUsers[0];
  const dummyUser2 = dummyUsers[1];
  let userAuthToken;
  let user2AuthToken;
  let docToBeDeletedId;
  before(() => User
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => Document.destroy(
      {
        where: {},
        cascade: true,
        restartIdentity: true
      }))
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUser,
        confirmationPassword: dummyUser.password
      })
      .expect(200)
      .then((response) => {
        userAuthToken = response.body.token;
      }))
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUser2,
        confirmationPassword: dummyUser2.password
      })
      .expect(200)
      .then((response) => {
        user2AuthToken = response.body.token;
      }))
    .catch(error => error)
  );

  it(`should respond with ${errorMessages.voidDocumentDeleteError}
  user tries to delete document that does not exist in the
  database`, () => request
      .delete('/api/v1/documents/1')
      .set('Authorization', userAuthToken)
      .expect(403)
      .expect((response) => {
        const errorMessage = response.body.error;
        assert.equal(errorMessage, errorMessages.voidDocumentDeleteError);
      })
  );
  it(`should respond with ${errorMessages.docDeleteUnauthorizedError}
  when user tries to delete document that does not 
  belong to her`, () => request
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
          assert.equal(error, errorMessages.docDeleteUnauthorizedError);
        }))
  );
  it(`should respond with ${successMessages.docDeleteSuccessful}
  when user tries to delete her own document`, () => request
      .delete(`/api/v1/documents/${docToBeDeletedId}`)
      .set('Authorization', user2AuthToken)
      .expect(200)
      .expect((response) => {
        const successMessage = response.body.message;
        const expectedSuccessMessage = successMessages.docDeleteSuccessful;
        assert.equal(successMessage, expectedSuccessMessage);
      })
  );
});
