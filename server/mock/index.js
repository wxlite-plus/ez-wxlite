const express = require('express');
const mockServer = express();
const init = require('./init.js');

init(mockServer);

module.exports = mockServer;
