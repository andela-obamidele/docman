export default {
  genericErrorMessage: `an error occured while trying to assess this endpoint.
  please check the documentatioin for proper use`,
  userAuthErrors: {
    conflictingPasswordError: `the confirmation password and new password
    doesn't match`,
    badEmailError: 'badly formatted email',
    incompleteCredentialsError: `incomplete credential provided.
    see documentation to find out all required fields for this endpoint`,
    duplicateEmailError: 'this email is already used',
    duplicateUsernameError: 'this username is already used',
    wrongEmailOrPassword: 'wrong email or password',
    wrongPasswordError: `wrong password! please provide the right password to
    complete 
    this action. 
    if you're using your password, it only means that you're trying
    to access a data you're not authorized to access.
    `,
    userNotFound: `sorry you don't have a docman account.
    please signup first.`,
    unAuthorizedUserError: `sorry, you don't have permission to carry out this 
    action.
    please signup first or login if you have not`,
  },
  genericUserUpdateError: `unfortunately, an error occurred while update 
  your profile.
  that is all we know. 
  if you think this is a bug, please lets solve it together by raising an 
  issue on our github at https://github.com/andela-bamidele/docman`,
  passwordUpdateError: `it seems you're trying to change your password.
  please make sure your new password and confirmation password is the same.`,
  fullNameLimitError: 'you have exceeded the character limit(25) for fullName',
  usernameLimitError: `username should have a minimum of 4 characters and a 
  maximum of 15 characters`,
  bioLimitError: `your bio should not have more than 240 characters. 
  Please compose a more concise bio`,
  userNotFound: 'there is no user with that Id in the database',
  paginationQueryError: 'sorry, limit and offset shoud be numbers',
  wrongIdTypeError: 'param \'id\' should be a number',
  errorCodes: {
    errNoDefaultForField: '1364',
    erDupEntry: '23505',
    notAnInt: '22P02'
  },
};
