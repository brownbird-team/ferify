// @ts-check

const config = require('../../config.test.json');
const { z } = require('zod');

const ConfigContextScheme = z.object({
    databaseHost: z.string(),
    databasePort: z.number(),
    databaseName: z.string(),
    databaseUsername: z.string(),
    databasePassword: z.string(),
});

/** 
 * @typedef { z.infer<typeof ConfigContextScheme> } TestConfig
 */

class TestConfigContext {

    /** @type {TestConfig} */
    config;

    constructor() {
        try {
            this.config = ConfigContextScheme.parse(config)

        } catch(err) {
            if(err instanceof z.ZodError){
                const paths = err.errors.map(
                    error => `    => ${error.path}: ${error.message}`
                );

                console.error('Following configuration errors occurred:');
                console.error(paths.join('\n'));

                throw new Error('Cannot start application with invalid configuration');
            }

            throw err;
        }
    }
}

exports.TestConfigContext = TestConfigContext;