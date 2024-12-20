var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

var skillsRouter = require('./routes/skills');
var usersRouter = require('./routes/users');
//var adminRouter = require('./routes/admin');

var app = express();

// Conectar con la base de datos de MongoDB
mongoose.connect('mongodb://localhost:27017/skills', {
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.error('Error de conexión a MongoDB:', err));

// Middleware
app.use(bodyParser.json());

// Middleware para manejar sesiones
app.use(session({
  secret: 'mysecretkey',  // Una clave secreta para firmar la sesión
  resave: false,          // No resguardar la sesión si no ha cambiado
  saveUninitialized: true // No guardar sesiones no inicializadas
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'scripts')));
app.use(express.static(path.join(__dirname,'badges')));

// Ruta para cargar las medallas y los puntos
app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'leaderboard.html'));
});

// Ruta para cargar especificacionesComp
app.get('/especificacionesComp', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'especificacionesComp.html'));
});

// Ruta para cargar login
app.get('/users/login', (req, res) => {
  const mensajeLogout = req.query.mensajeLogout;
  res.render('login', { mensajeLogout });
});

// Ruta para cargar register
app.get('/users/register', (req, res) => {
  res.render('register');
});

app.get('/:skillTreeName/edit/:skillID', (req, res) => {
  res.render('editSkill');
});

app.use('/users', usersRouter);
app.use('/skills', skillsRouter);
//app.use('/admin', adminRouter);

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
