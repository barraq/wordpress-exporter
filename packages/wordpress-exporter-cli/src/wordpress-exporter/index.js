import path from 'path';
import fs from 'fs-extra';
import logger from './logger';

const options = require('yargs') // eslint-disable-line
  .usage('\nUsage: wordpress-exporter [options] <cmd> [args]')
  .option('host', {
    describe: 'choose a host',
    default: 'https://www.freeletics.com',
  })
  .option('lang', {
    describe: 'choose locale',
    default: 'en',
    choices: ['en', 'fr', 'de', 'it', 'es', 'pt', 'tr'],
  })
  .option('site', {
    describe: 'choose a site',
    default: 'blog',
    choices: ['blog', 'knowledge'],
  })
  .option('settings', {
    describe: 'provide settings file path',
    default: `.${path.sep}settings.json`,
    coerce: arg => JSON.parse(fs.readFileSync(path.join(path.resolve(arg)))),
  })
  .option('silent', {
    boolean: true,
    describe: 'disable all logging',
  })
  .option('verbose', {
    alias: 'debug',
    boolean: true,
    describe: 'enable all logging',
  })
  .option('info', {
    boolean: true,
    describe: 'display contextual information',
  })
  .option('verbosity', {
    choices: ['all', 'error', 'warn', 'notice', 'info', 'none'],
    default: 'notice',
  })
  .commandDir('cmds')
  .demandCommand()
  .argv;

if (options.silent) {
  logger.verbosity = 'none';
} else if (options.verbose || options.debug || options.info) {
  logger.verbosity = 'all';
} else {
  logger.verbosity = options.verbosity;
}
