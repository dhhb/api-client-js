'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createAPIClient;

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _superagentJsonapify = require('superagent-jsonapify');

var _superagentJsonapify2 = _interopRequireDefault(_superagentJsonapify);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(0, _superagentJsonapify2.default)(_superagent2.default);

var ApiEmitter = function (_EventEmitter) {
  _inherits(ApiEmitter, _EventEmitter);

  function ApiEmitter() {
    _classCallCheck(this, ApiEmitter);

    return _possibleConstructorReturn(this, (ApiEmitter.__proto__ || Object.getPrototypeOf(ApiEmitter)).apply(this, arguments));
  }

  return ApiEmitter;
}(_events.EventEmitter);

function createAPIClient(_apiUrl) {
  var apiUrl = _apiUrl + '/v1';

  var prvt = {};
  var pblc = {
    apiUrl: apiUrl,
    events: new ApiEmitter()
  };

  var sessionTokenId = void 0;

  // conform to json api spec
  // http://jsonapi.org
  prvt.createJsonApiRecord = function (type, id, attributes) {
    if (id && !attributes) {
      attributes = id;
      id = void 0;
    }

    var jsonData = { data: { type: type, attributes: attributes } };

    if (id) {
      jsonData.data.id = id;
    }

    return jsonData;
  };

  prvt._parseJsonApiError = function () {
    var err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var jsonData = {
      status: err.status,
      message: err.message
    };

    var res = err.response;

    if (res && res.body) {
      jsonData.error = res.body.errors[0];
    } else {
      jsonData.error = {};
    }

    return jsonData;
  };

  prvt._request = function (resource) {
    var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';
    var params = arguments[2];
    var query = arguments[3];

    var url = '' + apiUrl + resource;

    return new Promise(function (resolve, reject) {
      (0, _superagent2.default)(method, url).set('Content-Type', 'application/vnd.api+json').use(function (req) {
        pblc.events.emit('request:start', req);

        if (sessionTokenId) {
          req.set('Authorization', sessionTokenId);
        }
      }).query(query).send(params).then(function (res) {
        pblc.events.emit('request:end', res);
        resolve(res.body && res.body.data || {});
      }).catch(function (err) {
        pblc.events.emit('request:end', err.response);

        if (err.status === 401) {
          pblc.events.emit('unauthorized', err);
        }

        reject(prvt._parseJsonApiError(err));
      });
    });
  };

  // Authentication
  pblc.setSession = function (tokenId) {
    sessionTokenId = tokenId;

    return pblc;
  };

  pblc.authorize = function (creds) {
    return prvt._request('/token', 'POST', prvt._createJsonApiRecord('token', creds));
  };
  pblc.login = pblc.authorize; // alias

  // Users
  pblc.getUsers = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var query = {};

    if (opts.include) {
      query.include = opts.include;
    }

    return prvt._request('/users', 'GET', {}, query);
  };

  pblc.getUser = function (id) {
    return prvt._request('/users/' + id, 'GET');
  };

  pblc.createUser = function (data) {
    return prvt._request('/users', 'POST', prvt._createJsonApiRecord('users', data));
  };

  pblc.updateUser = function (data, id) {
    return prvt._request('/users/' + id, 'PATCH', prvt._createJsonApiRecord('users', id, data));
  };

  pblc.deleteUser = function (id) {
    return prvt._request('/users/' + id, 'DELETE');
  };

  // Articles
  pblc.getArticles = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var query = {};

    if (opts.include) {
      query.include = opts.include;
    }

    if (opts.filter) {
      query.filter = _extends({}, opts.filter);
    }

    return prvt._request('/articles', 'GET', {}, query);
  };

  pblc.getArticle = function (id) {
    return prvt._request('/articles/' + id, 'GET');
  };

  pblc.createArticle = function (data) {
    return prvt._request('/articles', 'POST', prvt._createJsonApiRecord('articles', data));
  };

  pblc.updateArticle = function (data, id) {
    return prvt._request('/articles/' + id, 'PATCH', prvt._createJsonApiRecord('articles', id, data));
  };

  pblc.deleteArticle = function (id) {
    return prvt._request('/articles/' + id, 'DELETE');
  };

  // Categories
  pblc.getCategories = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var query = {};

    if (opts.include) {
      query.include = opts.include;
    }

    return prvt._request('/categories', 'GET', {}, query);
  };

  pblc.getCategory = function (id) {
    return prvt._request('/categories/' + id, 'GET');
  };

  pblc.createCategory = function (data) {
    return prvt._request('/categories', 'POST', prvt._createJsonApiRecord('categories', data));
  };

  pblc.updateCategory = function (data, id) {
    return prvt._request('/categories/' + id, 'PATCH', prvt._createJsonApiRecord('categories', id, data));
  };

  pblc.deleteCategory = function (id) {
    return prvt._request('/categories/' + id, 'DELETE');
  };

  return pblc;
}
module.exports = exports['default'];
