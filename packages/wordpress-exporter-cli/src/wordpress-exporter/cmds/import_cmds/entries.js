import _ from 'lodash';
import path from 'path';
import fs from 'fs-extra';
import Promise from 'bluebird';

import logger from '../../logger';
import { importToSpace } from '../../contentful';
import { SPACE_CONFIG_DIR, SPACE_CONFIG_FILE } from '../../utils';

export const command = 'entries';
export const describe = 'Import entries to Contentful';
export function builder(yargs) {
  return yargs.option('dir', {
    describe: 'Select root directory where to prepare data.',
    default: `.${path.sep}data`,
  });
}
export async function handler({ lang, site, dir }) {
  try {
    const configFile = path.join(SPACE_CONFIG_DIR, SPACE_CONFIG_FILE(site, lang));

    if (!fs.pathExistsSync(configFile)) {
      throw new Error(`No space config found for site ${site} and lang ${lang}`);
    } else {
      const space = await fs.readJson(configFile);
      const entries = await fs.readJson(path.resolve(dir, lang, 'export', 'entries.json'));

      const chunks = _.chunk(entries, 200);
      logger.info(`Importing ${entries.length} entries into ${chunks.length} chunks to space ${space.id}`);

      await Promise.mapSeries(chunks, async (chunk, id) => {
        logger.info(` Processing chunk ${id}/${chunks.length}`);
        return importToSpace(
          space.id,
          { entries: chunk },
        );
      });

      logger.info(`Importing entries to space ${space.id}...`);
      await importToSpace(
        space.id,
        { entries },
      );
    }
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}
