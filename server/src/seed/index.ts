import { seedAdmin } from './admin.seed';

export const runSeed = async () => {
  await seedAdmin();
};
