var adal = require('adal-node');

var Request = require('../../common/request'),
  cache = require('../../common/cache'),
  config = require('config').get('powerbi'),
  constants = require('../../common/constants'),
  CommonServices = require('../commonServices'),
  logger = require('../../logger');

var baseUrl = config.baseUrl;

/**
 * PowerBiManager contains powerbi rest api calls 
 */
var PowerBiManager = function () {

  /**
   * Get access token from Azure active directory
   */
  var getAuthenticationToken = async function () {
    var commonServices = new CommonServices();
    var powerbiDetails = await commonServices.getGlobalSettings('powerbi');
    var authorityUrl = `${config.authority}/${powerbiDetails.tenantId}`;
    var authContext = new adal.AuthenticationContext(authorityUrl);

    // use service principal and appId to get an aad token
    return new Promise(function (resolve, reject) {
      if (cache.get('powerbiToken')) return resolve(cache.get('powerbiToken'));
      authContext.acquireTokenWithClientCredentials(config.resource, powerbiDetails.applicationId, powerbiDetails.servicePrincipalKey, function (err, tokenResponse) {
        if (err) {
          logger.error('common', 'Failed to acquire access token ', err);
          reject({
            code: constants.httpCodes.unauthorized,
            message: constants.powerbi.accessTokenError
          });
        }
        logger.info('common', 'Successfully acuqired token from azure ad');
        cache.set('powerbiToken', tokenResponse, 3500);
        resolve(tokenResponse);
      });
    });
  }

  /**
   * Get dashboard details
   * @param {*} workspaceId 
   * @param {*} reportId 
   */
  var getDashboardTiles = function (workspaceId, dashboardId) {
    var url = `${baseUrl}/groups/${workspaceId}/dashboards/${dashboardId}/tiles`;
    return getAuthenticationToken()
      .then(function (token) {
        var options = {
          url,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token['accessToken']}`
          },
        };

        return Request().makeRequest(options)
          .then(function (response) {
            if (response && response.statusCode === 200) {
              return JSON.parse(response.body);
            } else {
              logger.error('common', 'Failed to get dashboard details from powerbi', response.body);
              throw {
                code: response && response.statusCode ? response.statusCode : constants.httpCodes.internalServerError,
                message: constants.powerbi.getReportFromPowerbiError
              };
            }
          });
      });
  }

  /**
   * Get reports details
   * @param {*} workspaceId 
   * @param {*} reportId 
   */
  var getReport = function (workspaceId, reportId) {
    var url = `${baseUrl}/groups/${workspaceId}/reports/${reportId}`;
    return getAuthenticationToken()
      .then(function (token) {
        var options = {
          url,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token['accessToken']}`
          },
        };

        return Request().makeRequest(options)
          .then(function (response) {
            if (response && response.statusCode === 200) {
              return JSON.parse(response.body);
            } else {
              logger.error('common', 'Failed to get report details from powerbi', response.body);
              throw {
                code: response && response.statusCode ? response.statusCode : constants.httpCodes.internalServerError,
                message: constants.powerbi.getReportFromPowerbiError
              };
            }
          });
      });
  }

  /**
   * Get embed token for given dashboard
   * @param {*} workspaceId
   * @param {*} dashboardId 
   */
  var getEmbedTokenForDashboard = function (workspaceId, dashboardId) {
    var url = `${baseUrl}/groups/${workspaceId}/dashboards/${dashboardId}/GenerateToken`;
    return getAuthenticationToken()
      .then(function (token) {
        var options = {
          url,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token['accessToken']}`
          },
          body: {
            'accessLevel': 'view'
          },
          json: true,
        };

        return Request().makeRequest(options)
          .then(function (response) {
            if (response && response.statusCode === 200) {
              return {
                'reportId': dashboardId,
                'token': response.body.token
              };
            } else {
              logger.error('common', 'Failed to get embed token from powerbi', response.body);
              throw {
                code: constants.httpCodes.internalServerError,
                message: constants.powerbi.getEmbedTokenError
              };
            }
          });
      });
  }

  /**
   * Get embed token for given report
   * @param {*} workspaceId
   * @param {*} reportId 
   */
  var getEmbedTokenForReport = function (workspaceId, reportId) {
    var url = `${baseUrl}/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
    return getAuthenticationToken()
      .then(function (token) {
        var options = {
          url,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token['accessToken']}`
          },
          body: {
            'accessLevel': 'View'
          },
          json: true,
        };

        return Request().makeRequest(options)
          .then(function (response) {
            if (response && response.statusCode === 200) {
              return {
                'reportId': reportId,
                'token': response.body.token
              };
            } else {
              logger.error('common', 'Failed to get embed token from powerbi', response.body);
              throw {
                code: response.statusCode,
                message: constants.powerbi.getEmbedTokenError
              };
            }
          });
      });
  }

  var getDataset = function (workspaceId, reportId, reportType) {
    if (reportType === 'report') {
      return getReport(workspaceId, reportId)
        .then(function (reportDetails) {
          return {
            workspaceId: workspaceId,
            datasetId: reportDetails.datasetId
          };
        });
    } else if (reportType === 'dashboard') {
      return getDashboardTiles(workspaceId, reportId)
        .then(function (dashboardDetails) {
          return dashboardDetails.value.map(function (tile) {
            return {
              workspaceId: workspaceId,
              datasetId: tile.datasetId
            };
          });
        });
    }
  }

  /**
   * Send refresh request to powerbi for the given dataset
   * @param {*} groupId 
   * @param {*} datasetId 
   */
  var sendRefreshRequestForDataset = function (groupId, datasetId) {
    var url = `${baseUrl}/groups/${groupId}/datasets/${datasetId}/refreshes`;
    return getAuthenticationToken()
      .then(function (token) {
        var options = {
          url,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token['accessToken']}`
          },
          body: {
            'notifyOption': 'NoNotification'
          },
          json: true
        };

        logger.info('common', 'Sending Refresh request for powerbi dataset', datasetId);

        return Request().makeRequest(options)
          .then(function (response) {
            if (response && response.statusCode === 202) {
              logger.info('common', 'Sent refresh request for powerbi dataset', datasetId);
              return constants.powerbi.refreshAccepted;
            } else {
              logger.error('common', `Powerbi dataset refresh request rejected with status code ${response.statusCode}`, response.body);
              throw {
                code: constants.httpCodes.internalServerError,
                message: constants.powerbi.refreshRejected
              };
            }
          });
      });
  }

  /**
   * Check refresh status
   * @param {*} groupId 
   * @param {*} datasetId 
   */
  var checkRefreshStatus = function (groupId, datasetId) {
    var url = `${baseUrl}/groups/${groupId}/datasets/${datasetId}/refreshes?$top=1`;
    return getAuthenticationToken()
      .then(function (token) {
        var options = {
          url,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token['accessToken']}`
          },
        };

        return Request().makeRequest(options)
          .then(function (response) {
            if (response && response.statusCode === 200) {
              return JSON.parse(response.body);
            } else {
              logger.error('common', 'Unable to fetch refresh status history', response.body);
            }
          });
      });
  }

  return {
    getEmbedTokenForDashboard,
    getEmbedTokenForReport,
    getReport,
    getDashboardTiles,
    getDataset,
    sendRefreshRequestForDataset,
    checkRefreshStatus
  }
}

module.exports = PowerBiManager;
