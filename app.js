const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

require("dotenv").config();

const { errorLogger, errorResponder, invalidPathHandler } = require('./errors');

const indexRouter = require('./routes/index');
const nftsRouter = require('./routes/nfts');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* Routes */
app.use('/', indexRouter);
app.use('/nfts', nftsRouter);

/* Error handling */
// Attach the first Error handling Middleware
// function defined above (which logs the error)
app.use(errorLogger)

// Attach the second Error handling Middleware
// function defined above (which sends back the response)
app.use(errorResponder)

// Attach the fallback Middleware
// function which sends back the response for invalid paths)
app.use(invalidPathHandler)

module.exports = app;
