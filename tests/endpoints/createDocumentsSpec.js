import { assert } from 'chai';
import supertest from 'supertest';
import jwtDriver from 'jsonwebtoken';
import { User, Document } from '../../server/models/';
import server from '../../server/server';
import dummyUsers from '../dummyData/dummyUsers';
import errorConstants from '../../server/constants/errorConstants';


const {
  invalidDocAccessLevelError,
  duplicateDocTitleError
} = errorConstants;

const request = supertest(server);

describe('POST /api/v1/documents/', () => {
  const { email, password, username } = dummyUsers[0];
  const dummyUser = {
    email,
    password,
    username,
    confirmationPassword: password
  };
  let jwt;
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
      .send(dummyUser)
      .expect(201)
      .then((response) => {
        jwt = response.body.token;
      })
    )
  );

  it(`should respond with '${invalidDocAccessLevelError}'
  an invalid access is specified`, () => request
      .post('/api/v1/documents/')
      .send({
        title: 'some title',
        content: 'some content',
        access: 'sh*t'
      })
      .set('Authorization', jwt)
      .expect(403)
      .expect((response) => {
        assert.equal(response.body.error, invalidDocAccessLevelError);
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
      .set('Authorization', jwt)
      .expect(400)
      .expect((response) => {
        const error = response.body.error;
        assert
          .equal(
            error.message,
            'title cannot be empty'
          );
      }));
  it('should respond with an array of errors multiple validation error occurs',
    () => request
      .post('/api/v1/documents')
      .send({
        title: null,
        content: null,
        access: 'public'
      })
      .set('Authorization', jwt)
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

  it(`should respond with the created user object when valid  payload
      is expected`, () => request
      .post('/api/v1/documents')
      .send({
        title: 'some title',
        content: 'some content',
        access: 'public'
      })
      .set('Authorization', jwt)
      .expect(201)
      .expect((response) => {
        const doc = response.body.document;
        const expectedAuthor = jwtDriver.decode(jwt.split(' ')[1]);
        const expectedAuthorId = expectedAuthor.data.id;
        assert.equal(doc.title, 'some title');
        assert.equal(doc.content, 'some content');
        assert.equal(doc.access, 'public');
        assert.equal(doc.author, expectedAuthorId);
      })
  );
  it(`should respond with '${duplicateDocTitleError}' when document
  title already exist in the database`, () => request
      .post('/api/v1/documents')
      .send({
        title: 'some title',
        content: 'some content',
        access: 'public'
      })
      .set('Authorization', jwt)
      .expect(409)
      .expect((response) => {
        const error = response.body.error;
        assert.equal(error, duplicateDocTitleError);
      })
  );
});
