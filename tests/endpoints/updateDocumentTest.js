import { assert } from 'chai';
import supertest from 'supertest';
import server from '../../server/server';
import { User, Document } from '../../server/models/';
import errorMessages from '../../server/constants/errors';
import dummyUsers from '../dummyData/dummyUsers';

const request = supertest(server);

describe('PUT /api/v1/documents', () => {
  const dummyUser1 = dummyUsers[0];
  const dummyUser2 = dummyUsers[1];
  let user1AuthorizationToken;
  let user2AuthorizationToken;
  let user1DocumentId;
  before(() => User
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => Document
      .destroy({ where: {}, cascade: true, restartIdentity: true })
    )
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUser1,
        confirmationPassword: dummyUser1.password
      })
      .expect(200)
      .then((response) => {
        user1AuthorizationToken = response.body.token;
      })
    )
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUser2,
        confirmationPassword: dummyUser2.password
      })
      .expect(200)
      .then((response) => {
        user2AuthorizationToken = response.body.token;
      })
    )
    .catch(error => error)
  );

  it(`should respond with ${errorMessages.emptyDocUpdateError} when 
  user do not provide all of the fields that is 
  required to update`, () => request
      .post('/api/v1/documents')
      .send({
        title: 'tdd',
        content: 'tdd is cool',
        access: 'public'
      })
      .set('Authorization', user1AuthorizationToken)
      .expect(201)
      .then((response) => {
        user1DocumentId = response.body.document.id;
      })
      .then(() => request
        .put(`/api/v1/documents/${user1DocumentId}`)
        .send({
        })
        .set('Authorization', user1AuthorizationToken)
        .expect(400)
        .expect((response) => {
          assert.equal(
            response.body.error,
            errorMessages.emptyDocUpdateError);
        })
      )
  );
  it(`should respond with ${errorMessages.wrongIdTypeError} when a none number
is provided as an id in parameters`, () => request
      .put('/api/v1/documents/someranomebullsh*t')
      .send({})
      .set('Authorization', user1AuthorizationToken)
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, errorMessages.wrongIdTypeError);
      })
  );
  it(`should respond with invalid ${errorMessages.invalidDocAccessLevelError}
when you try to update with wrong input type`, () => request
      .put(`/api/v1/documents/${user1DocumentId}`)
      .send({ access: 'normal' })
      .set('Authorization', user1AuthorizationToken)
      .expect(403)
      .expect((response) => {
        assert.equal(
          response.body.error,
          errorMessages.invalidDocAccessLevelError);
      }));
  it(`should respond with new updated data when legal payload 
  is provided to the endpoint`, () => request
      .put(`/api/v1/documents/${user1DocumentId}`)
      .send({ content: 'new content' })
      .set('Authorization', user1AuthorizationToken)
      .expect(200)
      .expect((response) => {
        const newDoc = response.body.document;
        assert.equal(newDoc.content, 'new content');
      }));
  it(`should not be able to update title with a title that is already used by 
  someone else`, () => request
      .post('/api/v1/documents/')
      .send({
        content: 'second user content',
        title: 'second user title',
        access: 'public'
      })
      .set('Authorization', user2AuthorizationToken)
      .expect(201)
      .then(() => request
        .put(`/api/v1/documents/${user1DocumentId}`)
        .send({ title: 'second user title' })
        .set('Authorization', user1AuthorizationToken)
        .expect(400)
        .expect((response) => {
          assert.typeOf(response.body.errors, 'Array');
          const affectedField = response.body.errors[0].field;
          assert.equal(affectedField, 'title');
        })
      )
  );
});
