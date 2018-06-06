const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


function calMonth(date) {
  var year2 = date.getFullYear();
  var month2 = date.getMonth() + 1;
  var res = new Array;
  if (month2 <= 2) {
    var year0 = year2 - 1;
    var month0 = month2 - 2 + 12;
    var month1 = month2 - 1 + 12;
  } else {
    year0 = year2;
    month0 = month2 - 2;
    month1 = month2 - 1;
  }
  res[0] = year0 + "-" + formatNumber(month0);
  res[1] = year0 + "-" + formatNumber(month1);
  res[2] = year2 + "-" + formatNumber(month2);
  return res;
}

module.exports = {
  formatTime: formatTime,
  calMonth: calMonth
}

