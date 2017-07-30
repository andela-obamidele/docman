export default {
  GENERIC_ERROR_MESSAGE: 'an error occured while trying to assess this endpoint. please check the documentatioin for proper use',
  userAuthErrors: {
    CONFLICTING_PASSWORDS_ERROR: 'the two passwords you provided does not match',
    BAD_EMAIL_ERROR: 'badly formatted email',
    INCOMPLETE_CREDENTIALS_ERROR: 'incomplete credential provided. see documentation to find out all required fields for this endpoint',
    DUPLICATE_EMAIL_ERROR: 'this email is already used'
  },
  errorCodes: {
    ER_NO_DEFAULT_FOR_FIELD: 1364,
    ER_DUP_ENTRY: 1062
  }
};
