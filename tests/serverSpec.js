import supertest from 'supertest';
import { assert } from 'chai';
import server from '../server/server';
import ErrorConstants from '../server/constants/ErrorConstants';

const request = supertest(server);
describe('server errors', () => {
  it('should return an error when an unaccepted method is used with it',
    () => request
      .copy('/api/v1/')
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, ErrorConstants.badMethodError);
      }));
  it(`should return an error message when you are trying to access a 
  non-existing route`,
    () => request
      .post('/free/style/on/my/api:/and/get/busted')
      .expect(404)
      .expect((response) => {
        assert.equal(response.body.error,
          ErrorConstants.invalidEndpointError);
      }));
});
