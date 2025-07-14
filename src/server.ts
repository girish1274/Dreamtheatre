import { buildServer } from './app.js';
import { logger } from './utils/logger.js';

const start = async () => {
  const server = await buildServer();

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    logger.info('Server listening on port 3000');
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});