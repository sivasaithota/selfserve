const enframeJsCommon = require('@opexanalytics-rad/enframe-js-common');
const config = require('config');

module.exports = enframeJsCommon.opexKeycloak(config.keycloak);
