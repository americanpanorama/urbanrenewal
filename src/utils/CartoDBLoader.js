import Queue from 'queue-async';

import config from '../../basemaps/cartodb/config.json';
import CartoDBClient from 'cartodb-client';

const cartoDBClient = new CartoDBClient(config.userId, { apiroot: 'https://' + config.userId + '.cartodb.com/api/v2/' });

const CartoDBLoader = {
  query: function (queryConfigs) {

    return new Promise((resolve, reject) => {

      // Run up to 3 requests in parallel
      let queue = Queue(3);
      queryConfigs.forEach((queryConfig) => {
        queue.defer(this.request, queryConfig);
      });

      queue.awaitAll((error, ...responses) => {
        if (error) {
          reject(error);
        } else {
          resolve(...responses);
        }
      });

    });

  },

  request: function (queryConfig, callback) {

    cartoDBClient.sqlRequest(queryConfig.query, function(err, response) {
      if (!err) {
        let innerResponse;
        switch (queryConfig.format.toLowerCase()) {
        case 'geojson':
          innerResponse = response.features;
          break;
        default:
          innerResponse = response.rows;
          break;
        }
        callback(null, innerResponse);
      } else {
        callback(err);
      }
    }, {
      'format': queryConfig.format,
      'dangerouslyExposedAPIKey': config.apiKey
    });

  }
  
};

export default CartoDBLoader;
