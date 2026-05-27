const app = require('./app');
const { env } = require('./config/env');

function startServer() {
  app.listen(env.port, () => {
    console.log(`API server running on port ${env.port}`);
  });
}

module.exports = {
  startServer,
};
