import { connectDatabase, disconnectDatabase } from '../src/shared/config/database';
import { UserModel } from '../src/infra/db/models/User';

(async () => {
  await connectDatabase();
  console.time('createUser');
  await UserModel.create({ email: 'bench@cermont.com', password: 'Test123!', name: 'Bench', role: 'admin' });
  console.timeEnd('createUser');
  await UserModel.deleteMany({});
  await disconnectDatabase();
})().catch((error) => {
  console.error('Benchmark failed', error);
  process.exit(1);
});