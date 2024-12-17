import { compareSync, hashSync } from 'bcrypt';
const SALT_OR_ROUNDS = 10;

export const hashPassword = (password: string): string => {
  return hashSync(password, SALT_OR_ROUNDS);
};

export const isPasswordMatch = (password: string, hash: string): boolean => {
  return compareSync(password, hash);
};
