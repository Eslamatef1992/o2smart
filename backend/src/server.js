const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`O2 Smart API listening on port ${env.port} (${env.nodeEnv})`);
});
