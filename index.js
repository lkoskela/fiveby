var fiveby = require('./lib/fiveby');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Properties = require('./lib/properties');
require('should');

//get project configuration if one exists
if (!global.fivebyConfig) {

  try {
    if (process.env.fivebyopts) {
      global.fivebyConfig = JSON.parse(process.env.fivebyopts);
    } else {
      var configPath = path.resolve('fiveby-config.json');
      global.fivebyConfig = JSON.parse(fs.readFileSync(configPath, {encoding: 'utf-8'}));
    }
  } catch (e) {
    console.error('No global config loaded %s', e);
    return process.exit(1);
  }

  //prep properties
  global.propertyService = new Properties(global.fivebyConfig.environment||'local');
  var props = global.propertyService.getProperties('default');
  props.setMany(global.fivebyConfig.properties||{});

}

//main test driver
module.exports = function (params, test) {

  var config = _.cloneDeep(global.fivebyConfig); //seperate config for merge

  if (arguments.length === 1) {//switch params for 1 arg
    test = params;
  } else {
    _.merge(config, params); //merge test params with config
  }

  if(global.fivebyConfig.disableBrowsers){
    test();
  } else {
    var fb = new fiveby(config);
    fb.runSuiteInBrowsers(test);
  }

};
