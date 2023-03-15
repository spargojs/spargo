/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { version } = require('./package.json');
const { readFile, writeFile } = require('fs');

readFile('./README.md', function (err, data) {
    if (err) {
        throw new Error(err);
    }

    data = data.toString();
    data = data.replace(/spargo@(.*?)\//gm, `spargo@${version}/`);

    writeFile('./README.md', data, function (err) {
        if (err) {
            throw new Error(err);
        }
    });
});