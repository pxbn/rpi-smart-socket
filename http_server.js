const http = require('http');
const fs = require('fs');
const url = require('url');
const utils = require('./utils.js');
const confHandler = require('./confHandler.js');

const hostname = '0.0.0.0';
const port = 3000;
const debug = process.argv.slice(2)[0] === '--debug';



const server = http.createServer((req, res) => {
    console.log("Device with IP" + req.connection.remoteAddress + " requested: " + req.url);

    //check if requesting device is permitted
    if (! (req.connection.remoteAdress ==  '192.168.178.23' || req.connection.remoteAddress == '192.168.178.118' || req.connection.remoteAddress == '192.168.178.28' || req.connection.remoteAddress == '192.168.178.24')) {
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('Hast gedacht cindy');
        res.end();
        console.log("Blocked request from IP " + req.connection.remoteAddress + " to: " + req.url);
	return;
    }

    if (req.url.startsWith('/index.html', 0)) {
        //return main page
        handleHtmlReq(req, res);
    } else if (req.url.startsWith('/js', 0)) {
        //return requested js
        handleJsReq(req, res);
    } else if (req.url.startsWith('/css', 0)) {
        //return requested css
        handleCssReq(req, res);
    } else if (req.url.startsWith('/data', 0)) {
        //return requested conf.json
        handleConfReq(req, res);
    } else {
        //non existing file requested return url for debug
        throwServerErr(res, "Requested " + url.path + " doesn't match file path on server");
    }
    res.end();
});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


/**
 * Handle html requests with slugs
 */
function handleHtmlReq(req, res) {
    //try to read according html file
    let html;
    try {
        html = fs.readFileSync('./htdocs/index.html');

    } catch (e) {
        throwServerErr(res, e);
        return;
    }

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write(html);

    //call the light script with slug params
    let slug = url.parse(req.url, true).query;

    if (slug.i !== undefined) {
        utils.handleQuery(slug, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("swithcted light with id " + slug.i);
                // addDataSync( "{ id:" + id + ", code: " + code + ", Value: " + value + "}");
            }
        });
    }
}

/**
 * Used to handle the css requests
 */
function handleCssReq(req, res) {
    let css;

    try {
        css = fs.readFileSync('.' + req.url);
    } catch (e) {
        throwServerErr(res, e);
        return;
    }

    res.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'});
    res.write(css)
}

/**
 * Handles every JS request
 */
function handleJsReq(req, res) {
    let req_path = req.url;
    let js_file;

    try {
        js_file = fs.readFileSync('.' + req_path);
    } catch (e) {
        throwServerErr(res, e);
        return;
    }
    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.write(js_file);
}


/**
 * Handles data queries
 */
function handleConfReq(req, res) {
    let slug = url.parse(req.url, true).query;

    if (slug.a === 'r') {
        //requested conf?
        returnConfig(res);

    } else if (slug.a === 'al') {
        //add light?
        addLight(res, slug);

    } else if (slug.a === 'rl') {
        //remove light?
        removeLight(res, slug);
    } else if (slug.a === 'ag') {
        //add group?
        addLightGroup(res, slug);

    } else if (slug.a === 'rg') {
        //remove groupe?
        removeLightGroup(res, slug);
    } else if (slug.a === 'reset') {
        resetConf(res);
    } else if (slug.a === 'cv') {
        handleQuery(res, slug);
    } else {
        //requested action not vaild
        throwServerErr(res, 'Query a="' + slug.a + '" not supported');
    }
}

/**
 * Adds light and returns JSON new config
 */
function addLight(res, slug) {
    let id = slug.i;
    let code = slug.c;
    let name = slug.n;
    confHandler.confAddLight(id, code, name, (e) => {
        if (e) {
            throwServerErr(res, e);
        } else {
            returnConfig(res);
        }
    });
}

/**
 * Removes light and returns new JSON config
 */
function removeLight(res, slug) {
    let id = slug.i;
    confHandler.confRemoveLight(id, (e) => {
        if (e) {
            throwServerErr(res, e);
        } else {
            returnConfig(res);
        }
    });
}

/**
 * Adds new light group and returns new JSON config
 */
function addLightGroup(res, slug) {
    let name = slug.n;
    let id = slug.i;
    confHandler.confAddLightGroup(name, id, (e) => {
        if (e) {
            throwServerErr(res, e);
        } else {
            returnConfig(res);
        }
    });
}

/**
 * Removes the groups from the given light's groups string
 */
function removeLightGroup(res, slug) {
    let name = slug.n;
    let id = slug.i;
    confHandler.confRemoveLightGroup(id, name, (e) => {
        if (e) {
            throwServerErr(res, e);
        } else {
            returnConfig(res);
        }
    });
}

/**
 * Send config JSON as response
 */
function returnConfig(res) {
    confHandler.getConf((e, conf) => {
        if (e) {
            throwServerErr(res, e);
        } else {
            //TODO: debug clearlog remove
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.write(conf);
        }
    });
}

/**
 * Handles a query for turning off/on a light
 */
function handleQuery(res, slug) {
    utils.handleQuery(slug, (e) => {
        if (e) {
            throwServerErr(res, e);
        } else {
            console.log('Switched light with id=' + slug.i + ' Code=' + slug.c + ' value=' + slug.v);
            res.writeHead(200);
        }
    });
}

/**
 * Resets the conf file with the backup conf file backup_conf.json
 */
function resetConf(res) {
    try {
        let backupConf = fs.readFileSync('./backup_conf.json');
        fs.writeFileSync('./conf.json', backupConf);
        returnConfig(res);
    } catch (e) {
        throwServerErr(res, e);
    }
}

/**
 * Throw 404 not found error prints error to console and log file.
 * However, the error isn't seen by the user
 * @param res is the server response
 * @param e Optional error string which gets saved to error.log
 */
function throwServerErr(res, e = '') {
    console.error(e);
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.write('404! Something went wrong:/');
}


