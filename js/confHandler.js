const fs = require('fs');
const utils = require('./utils.js');

/**
 * Returns the current setup configuration as JSON
 */
exports.getConf = function (callback) {
    loadJsonConfigFile((e, data) => {
        if (e) {
            return callback(e, null);
        } else {
            return callback(null, JSON.stringify(data));
        }
    });
};

/**
 * Add a light to the current setup configuration
 */
exports.confAddLight = function (id, code, name, callback) {
    loadJsonConfigFile((e, data) => {
        if (e) {
            //error case for loading the conf
            return callback(e);
        } else {
            let conf = data;
            //convert hex id to binary
            let bId = utils.toBinary(id);

            bId = bId.padStart(5, '0');
            conf.lights.push({"name": name, "code": code, "id": bId});
            //save the change
            writeJsonConfigFile(conf, (e) => {
                if (e) {
                    return callback(e);
                } else {
                    // console.log("added light...");
                    return callback(null);
                }
            });
        }
    });
};

/**
 * Removes a light from the current setup configuration
 */
exports.confRemoveLight = function (id, callback) {
    loadJsonConfigFile((e, data) => {
        if (e) {
            return callback(e);
        } else {
            let conf = data;
            let err = true;
            //find index of the light which will be delete and delete
            for (let i = 0; i < conf.lights.length; i++) {
                if (conf.lights[i].id === id){
                    conf.lights.splice(i, 1);
                    err = false;
                }
            }
            //didnt find id?
            if (err) {
                return callback('error in removing light with id ' + id);
            }  else {
                writeJsonConfigFile(conf, (e) => {
                    if (e) {
                        return callback(e);
                    } else {
                        // console.log('removed light..');
                        return callback(null);
                    }
                });
            }
        }
    });
};

/**
 * Adds a group of lights to the conf.json
 */
exports.confAddLightGroup = function (name, id, callback) {
    loadJsonConfigFile((e, data) => {
        if (e) {
            return callback(e);
        } else {
            let conf = data;
            //find light with id and append new group name
            for (let i = 0; i < conf.lights.length; i++) {
                if (conf.lights[i].id === id) {
                    let grp = conf.lights[i].groups;

                    //if empty just append, if already belongs to group append with ampersand
                    if (grp === "" ){
                        grp = grp.concat(name);
                    } else {
                        grp = grp.concat("&" + name);
                    }
                    conf.lights[i].groups = grp;
                }
            }
            writeJsonConfigFile(conf, (e) => {
                if (e) {
                    return callback(e);
                } else {
                    return callback(null);
                }
            });
        }
    });
};

/**
 * Removes a group of lights from the conf.json
 */
exports.confRemoveLightGroup = function (id, name, callback) {
    loadJsonConfigFile((e, data) => {
        if (e) {
            return callback(e);
        } else {
            let conf = data;
            //find light with id and append new group name
            for (let i = 0; i < conf.lights.length; i++) {
                if (conf.lights[i].id === id) {
                    let grp = conf.lights[i].groups;

                    //is group name the only element?
                    if (grp.indexOf(name) === 0 && grp.length === name.length){
                        grp = grp.replace(name, '');
                    }  else if (grp.indexOf(name) === 0 && grp.length > name.length) {
                        //more than one group -> following ampersand needs to be deleted aswell
                        grp = grp.replace(name + '&', '');
                    }
                    conf.lights[i].groups = grp;
                    break;
                }
            }
            writeJsonConfigFile(conf, (e) => {
                if (e) {
                    return callback(e);
                } else {
                    return callback(null);
                }
            });
        }
    });
};

/**
 * EFC: Loads the conf.json and returns the parsed JSON object
 */
function loadJsonConfigFile(callback) {
    let rawData;
    // console.log('loading config file...');
    try {
        rawData = fs.readFileSync('./conf.json');
        let data = JSON.parse(rawData);
        return callback(null, data);
    } catch (e) {
        console.error('Error in loading the config json!');
        // console.error(e);
        return callback(e, null);
    }
}

/**
 * Writes JSON Object to conf.json
 */
function writeJsonConfigFile(data, callback) {
    try {
        let jsonStr = JSON.stringify(data);
        fs.writeFileSync('./conf.json', jsonStr);
        return callback(null);
    } catch (e) {
        return callback(e);
    }
}