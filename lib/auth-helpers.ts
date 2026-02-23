import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export const requireSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session;
};
