function dateTimePad(value, digits) {
  let number = value;
  while (number.toString().length < digits) {
    number = `0` + number;
  }
  return number;
}

function format(tDate) {
  return (
    tDate.getFullYear() +
    `-` +
    dateTimePad(tDate.getMonth() + 1, 2) +
    `-` +
    dateTimePad(tDate.getDate(), 2) +
    ` ` +
    dateTimePad(tDate.getHours(), 2) +
    `:` +
    dateTimePad(tDate.getMinutes(), 2) +
    `:` +
    dateTimePad(tDate.getSeconds(), 2) +
    `.` +
    dateTimePad(tDate.getMilliseconds(), 3)
  );
}

function reset() {
  return `\x1b[0m\x1b[0m`;
}

function bgBlue(text) {
  return `\x1b[44m${text}\x1b[0m`;
}

function blackBgYellow(text) {
  return `\x1b[30m\x1b[43m${text}\x1b[0m`;
}

function blackBgRed(text) {
  return `\x1b[30m\x1b[41m${text}\x1b[0m`;
}

function green(text) {
  return `\x1b[32m${text}\x1b[0m`;
}

function blackBgWhite(text) {
  return `\x1b[30m\x1b[47m${text}\x1b[0m`;
}

function blackBgGreen(text) {
  return `\x1b[30m\x1b[42m${text}\x1b[0m`;
}

module.exports = class Logger {
  static log(content, type = `log`) {
    const date = `${reset()}[${format(new Date(Date.now()))}]:`;
    switch (type) {
      case `log`: {
        return console.log(`${date} ${bgBlue(type.toUpperCase())} ${content} `);
      }
      case `warn`: {
        return console.log(
          `${date} ${blackBgYellow(type.toUpperCase())} ${content} `
        );
      }
      case `error`: {
        return console.log(
          `${date} ${blackBgRed(type.toUpperCase())} ${content} `
        );
      }
      case `debug`: {
        return console.log(`${date} ${green(type.toUpperCase())} ${content} `);
      }
      case `cmd`: {
        return console.log(
          `${date} ${blackBgWhite(type.toUpperCase())} ${content}`
        );
      }
      case `ready`: {
        return console.log(
          `${date} ${blackBgGreen(type.toUpperCase())} ${content}`
        );
      }
      default:
        throw new TypeError(
          `Logger type must be either warn, debug, log, ready, cmd or error.`
        );
    }
  }
};
