'use strict';

import CountLog from '@scripts/model/common/CountLog';

console.log('Highway Route Result!');

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

const buttons = document.querySelectorAll('button#dialog');
buttons.forEach((button) => {
  button.addEventListener('click', (event) => {
    alert('click');
  });
});
