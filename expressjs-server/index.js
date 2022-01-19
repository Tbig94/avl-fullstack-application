const express = require('express');
const app = express();
const swaggerDoc = require('./docs/swagger.json');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
const ValidationError = require('express-validation');
const excelData = require('./middlewares/excel.js');
const logger = require('./middlewares/logger.js');

const PORT = process.env.PORT || 5000;

app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());

//#region Router
app.use('/', require('./api/routes/home'));
app.use('/login', require('./api/routes/login'));
app.use('/api/users', require('./api/routes/users'));
app.use('/api/roles', require('./api/routes/roles'));
app.use('/api/permissions', require('./api/routes/permissions'));
//#endregion

// #region Express Validation
app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }
  return res.status(500).json(err);
});
// #endregion

//#region Prisma - PORT
app.listen(PORT, excelData(), () => {
  console.log(`Listening to port ${PORT}...`);
  logger.info(`Server started on port ${PORT}`);
  console.log(`API documentation: http://localhost:5000/api/docs`);
});
//#endregion
