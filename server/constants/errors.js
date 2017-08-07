export default {
  genericErrorMessage: 'an error occured while trying to assess this endpoint. please check the documentatioin for proper use',
  userAuthErrors: {
    conflictingPasswordError: 'the two passwords you provided does not match',
    badEmailError: 'badly formatted email',
    incompleteCredentialsError: 'incomplete credential provided. see documentation to find out all required fields for this endpoint',
    duplicateEmailError: 'this email is already used',
    wrongEmailOrPassword: 'wrong email or password',
    userNotFound: 'sorry you don\'t have a docman account. please signup first.',
    unAuthorizedUserError: 'sorry, you don\'t have permission to carry out this action. please signup first or login if you have not',
  },
  userNotFound: 'there is no user with that Id in the database',
  paginationQueryError: 'sorry, limit and offset shoud be numbers',
  wrongIdTypeError: 'param \'id\' should be a number',
  errorCodes: {
    errNoDefaultForField: '1364',
    erDupEntry: '23505',
    notAnInt: '22P02'
  },
};
