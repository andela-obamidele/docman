const errorConstants = {
  badJSONRequest: 'you are sending an invalid json object',
  genericErrorMessage: 'an error occured while trying to assess this endpoint' +
  ' please check the documentatioin for proper use',
  userAuthErrors: {
    conflictingPasswordError: 'the confirmation password and new password' +
    ' doesn\'t match',
    badEmailError: 'badly formatted email',
    incompleteCredentialsError: 'incomplete credential provided.' +
    'see documentation to find out all required fields for this endpoint',
    duplicateEmailError: 'this email is already used',
    duplicateUsernameError: 'this username is already used',
    wrongEmailOrPassword: 'wrong email or password',
    wrongPasswordError: 'wrong password! please provide the right password to' +
    ' complete this action.',
    userNotFound: 'sorry you don\'t have a docman account.' +
    ' please signup first.',
    unAuthorizedUserError: 'sorry, you don\'t have permission to ' +
    'carry out this action.please signup first or login if you have not',
  },
  endOfPageReached: 'you have reached end of the page',
  unmatchedUserSearch: 'your query does not match any email in our database',
  voidUserDeleteError: 'the user you tried to delete is not on docman',
  userDeleteUnauthorizedError: 'sorry! you are only authorized to ' +
  'delete your own account',
  genericUserUpdateError: 'unfortunately, an error occurred while update ' +
  'your profile. that is all we know. if you think this is a bug, ' +
  'please lets solve it together by raising an issue on ' +
  'our github at https://github.com/andela-bamidele/docman',
  passwordUpdateError: `it seems you're trying to change your password.
  please make sure your new password and confirmation password is the same.`,
  fullNameLimitError: 'you have exceeded the character limit(25) for fullName',
  usernameLimitError: 'username should have a minimum of 4 characters and a ' +
  'maximum of 15 characters',
  bioLimitError: 'your bio should not have more than 240 characters. ' +
  'Please compose a more concise bio',
  userNotFound: 'there is no user with that Id in the database',
  paginationQueryError: 'sorry, limit and offset shoud be numbers',
  wrongIdTypeError: 'param \'id\' should be a number',
  duplicateDocTitleError: 'duplicate document title not allowed',
  invalidDocAccessLevelError: 'access can either be public, private or role',
  docTitleLimitError: 'document title should be between 1 to 30 characters',
  docContentLimitError: `document content should be between 1 to 10000 
  characters`,
  genericCreateDocErrorMessage: 'it seems you\'re trying to ' +
  'create a document. Unfortunately, this action cannot be completed.' +
  '  Please help us make your experience with our app better by rainsing an' +
  'issue at  https://github.com/andela-obamidele/docman or contact an admin' +
  ' at admin@docman.com',
  nullDocumentUpdateError: 'the document you\'re trying to update does\'nt' +
  ' exist',
  emptyDocUpdateError: 'you need to provide either access, title ,' +
  ' content  or the three',
  unauthorizedDocumentUpdateError: 'sorry, you can only edit your own document',
  voidDocumentDeleteError: 'we could not find the document you wanted to' +
  ' delete.',
  docDeleteUnauthorizedError: 'you must own this document or be an admin' +
  ' to be able to delete it',
  fileQueryForbiddenError: 'sorry, you are not permitted to view this file',
  noDocumentFoundError: 'no document found',
  docNotFound: 'no document found',
  badDocumentsQuery: 'query string q cannot be empty',
  errorCodes: {
    errNoDefaultForField: '1364',
    erDupEntry: '23505',
    notAnInt: '22P02',
    invalidEnumInput: '22P02'
  },
};
export default errorConstants;
