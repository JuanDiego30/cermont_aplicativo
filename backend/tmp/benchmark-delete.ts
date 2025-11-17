import { connectDatabase, disconnectDatabase } from '../src/shared/config/database';
import { UserModel } from '../src/infra/db/models/User';

(async () => {
  await connectDatabase();
  console.time('deleteMany');
  await UserModel.deleteMany({});
  console.timeEnd('deleteMany');
  await disconnectDatabase();
})().catch((error) => {
  console.error('Benchmark failed', error);
  process.exit(1);
});