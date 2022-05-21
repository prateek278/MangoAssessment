
const express = require('express');
const mysql = require('mysql');
const app = express();
var path = require('path');
const bodyParser = require('body-parser');
var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _config = require('./config.json');

var _config2 = _interopRequireDefault(_config);

var _TokenValidator = require('./middleware/tokenValidator');

var _TokenValidator2 = _interopRequireDefault(_TokenValidator);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const port = 3000;
app.use(_TokenValidator2.default);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'View'));
app.set('view engine', 'ejs');
var routes = require('./Routes/userroute'); //importing route

routes(app, { mergeParams: true });

app.get('/', (req, res) => {
    res.render('registration.ejs');
});
app.post('/generateToken', function (req, res) {
    var tokenObject = {
      userId: req.body.userName,
      name: "some name"
    };
    var refreshToken = _jsonwebtoken2.default.sign(tokenObject, _config2.default.refreshToken.secret, {
      expiresIn: _config2.default.refreshToken.expiresIn
    });
    var token = _jsonwebtoken2.default.sign(tokenObject, _config2.default.token.secret, {
      expiresIn: _config2.default.token.expiresIn
    });
    res.status(200).send({
      error: false,
      result: {
        token: token,
        refreshToken: refreshToken
      }
    });
  });
  app.post('/secured/validateToken', function (req, res) {
    var token = req.headers["authorization"];
    _jsonwebtoken2.default.verify(token, _config2.default.token.secret, function (err, decoded) {
      if (err) {
        if (req.body.refreshToken) {
          _jsonwebtoken2.default.verify(req.body.refreshToken, _config2.default.refreshToken.secret, function (err, decoded) {
            if (err) return res.status(401).send({ "error": true, "message": 'Failed to authenticate token.' });else {
              delete decoded["exp"];
              delete decoded["iat"];
              var token = _jsonwebtoken2.default.sign(decoded, _config2.default.token.secret, {
                expiresIn: _config2.default.token.expiresIn
              });
              res.status(401).send({ error: true, data: { token: token }, message: 'New token generated' });
            }
          });
        } else return res.status(401).send({ "error": true, "message": 'Failed to authenticate token.' });
      } else {
        req.body ? req.body["tokenDetails"] = decoded : null;
        res.status(200).send(decoded);
      }
    });
  });
app.listen(port, () => console.log(`App listening on port ${port}!`))