'use strict';

import CountLog from '@scripts/model/CountLog';

// console.log('Highway Route Result!');

function getTest () {
  const countLog = new CountLog();
  countLog.imp({
    cntlog: {
      label: 'highway.route.result',
      type: 'pc'
    }
  });
}

getTest();
