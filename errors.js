// Error handling Middleware function for logging the error message
const errorLogger = (error, request, response, next) => {
  console.log(`error: ${error.msg}`);
  next(error); // calling next middleware
};

// Error handling Middleware function reads the error message
// and sends back a response in JSON format
const errorResponder = (error, request, response, next) => {
  response.header("Content-Type", "application/json");

  const status = error.status || 400;
  response.status(status).send(error);
};

// Fallback Middleware function for returning
// 404 error for undefined paths
const invalidPathHandler = (request, response, next) => {
  response.status(404);
  response.send("invalid path");
};

const errorFormatter = (msg, data = {}) => {
    return {
        status: 400,
        msg,
        data
    }
}

module.exports = {
    errorLogger,
    errorResponder,
    invalidPathHandler,
    errorFormatter
}