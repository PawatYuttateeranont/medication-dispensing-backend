var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql= require('mysql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var controller = require('./controllers/controller')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Allow CORS */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Database connection
app.use(function(req, res, next){
    global.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '1234',
        database : 'MEDICATION_DISPENSING'
    });
    connection.connect();
    next();
});
// app.use('/', index);
// app.use('/api/v1/users', users);

app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.get('/doctors', controller.getDoctors)
app.get('/patients', controller.getPatients)
app.get('/medicines', controller.getMedicines)
app.get('/medicines/valid', controller.getValidMedicines)
app.get('/prescriptions', controller.getPrescriptions)
app.get('/prescriptions/:prescriptionId', controller.getPrescriptionById)
app.post('/create/prescription', controller.createPrescription)
app.post('/accept/prescription', controller.acceptPrescription)
app.post('/reject/prescription', controller.rejectPrescription)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
