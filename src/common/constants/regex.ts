export const VALID_USERNAME_REGEX = /^[a-zA-Z0-9._-]{5,20}$/;

export const VALID_PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/;
