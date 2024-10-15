import { db } from '@/lib/db';

export const getUserById = async (id: string) => {
  return db.user.findUnique({ where: { id } });
};

export const createUser = async (userData: any) => {
  return db.user.create({ data: userData });
};
