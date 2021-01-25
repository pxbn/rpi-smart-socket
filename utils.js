const shell = require('shelljs');

/**
 * Error-First-Callback (EFC) used to call the light script
 */
exports.handleQuery = function (slug, callback) {
    let id = slug.i;
    let code = slug.c;
    let value = slug.v;
    let args = process.argv.slice(2);

    if (id === undefined) {
        return callback('At utils.handleQuery: Slug parameter ID is missing', null);
    } else if (code === undefined) {
        return callback('At utils.handleQuery: Slug parameter CODE is missing', null);
    } else if (value === undefined) {
        return callback('At utils.handleQuery: Slug parameter VALUE is missing', null);
    } else {
        if (args[0] === '--debug') {
            //every nothing missing call light script
            shell.exec('./example_script');
            return callback(null);
        } else {
            try {
                shell.exec('./RPi_utils/send ' + code + ' ' + id + ' ' + value + ' 500');
                return callback(null);
            } catch (e) {
                return callback(e);
            }
        }

        //TODO: STACK ?!?!?

    }
};

exports.toBinary = function (data) {
    return (+data).toString(2);
};

