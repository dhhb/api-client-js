import request from 'superagent';
import superagentJsonapify from 'superagent-jsonapify';
import { EventEmitter } from 'events';

superagentJsonapify(request);

class ApiEmitter extends EventEmitter {}

export default function createAPIClient (_apiUrl) {
  const apiUrl = `${_apiUrl}/v1`;

  const prvt = {};
  const pblc = {
    apiUrl,
    events: new ApiEmitter()
  };

  let sessionTokenId;

  // conform to json api spec
  // http://jsonapi.org
  prvt.createJsonApiRecord = (type, id, attributes) => {
    if (id && !attributes) {
      attributes = id;
      id = void 0;
    }

    const jsonData = {data: { type, attributes }};

    if (id) {
      jsonData.data.id = id;
    }

    return jsonData;
  };

  prvt._parseJsonApiError = (err = {}) => {
    const jsonData = {
      status: err.status,
      message: err.message
    };

    const res = err.response;

    if (res && res.body) {
      jsonData.error = res.body.errors[0];
    } else {
      jsonData.error = {};
    }

    return jsonData;
  };

  prvt._request = (resource, method = 'GET', params, query) => {
    const url = `${apiUrl}${resource}`;

    return new Promise((resolve, reject) => {
      request(method, url)
        .set('Content-Type', 'application/vnd.api+json')
        .use(req => {
          pblc.events.emit('request:start', req);

          if (sessionTokenId) {
            req.set('Authorization', sessionTokenId);
          }
        })
        .query(query)
        .send(params)
        .then(res => {
          pblc.events.emit('request:end', res);
          resolve(res.body && res.body.data || {});
        })
        .catch(err => {
          pblc.events.emit('request:end', err.response);

          if (err.status === 401) {
            pblc.events.emit('unauthorized', err);
          }

          reject(prvt._parseJsonApiError(err));
        });
    });
  };

  // Authentication
  pblc.setSession = (tokenId) => {
    sessionTokenId = tokenId;

    return pblc;
  };

  pblc.authorize = (creds) => {
    return prvt._request('/token', 'POST', prvt._createJsonApiRecord('token', creds));
  };
  pblc.login = pblc.authorize; // alias

  // Users
  pblc.getUsers = (opts = {}) => {
    let query = {};

    if (opts.include) {
      query.include = opts.include;
    }

    return prvt._request('/users', 'GET', {}, query);
  };

  pblc.getUser = (id) => {
    return prvt._request(`/users/${id}`, 'GET');
  };

  pblc.createUser = (data) => {
    return prvt._request('/users', 'POST', prvt._createJsonApiRecord('users', data));
  };

  pblc.updateUser = (data, id) => {
    return prvt._request(`/users/${id}`, 'PATCH', prvt._createJsonApiRecord('users', id, data));
  };

  pblc.deleteUser = (id) => {
    return prvt._request(`/users/${id}`, 'DELETE');
  };

  // Articles
  pblc.getArticles = (opts = {}) => {
    let query = {};

    if (opts.include) {
      query.include = opts.include;
    }

    if (opts.filter) {
      query.filter = { ...opts.filter };
    }

    return prvt._request('/articles', 'GET', {}, query);
  };

  pblc.getArticle = (id) => {
    return prvt._request(`/articles/${id}`, 'GET');
  };

  pblc.createArticle = (data) => {
    return prvt._request('/articles', 'POST', prvt._createJsonApiRecord('articles', data));
  };

  pblc.updateArticle = (data, id) => {
    return prvt._request(`/articles/${id}`, 'PATCH', prvt._createJsonApiRecord('articles', id, data));
  };

  pblc.deleteArticle = (id) => {
    return prvt._request(`/articles/${id}`, 'DELETE');
  };

  // Categories
  pblc.getCategories = (opts = {}) => {
    let query = {};

    if (opts.include) {
      query.include = opts.include;
    }

    return prvt._request('/categories', 'GET', {}, query);
  };

  pblc.getCategory = (id) => {
    return prvt._request(`/categories/${id}`, 'GET');
  };

  pblc.createCategory = (data) => {
    return prvt._request('/categories', 'POST', prvt._createJsonApiRecord('categories', data));
  };

  pblc.updateCategory = (data, id) => {
    return prvt._request(`/categories/${id}`, 'PATCH', prvt._createJsonApiRecord('categories', id, data));
  };

  pblc.deleteCategory = (id) => {
    return prvt._request(`/categories/${id}`, 'DELETE');
  };

  return pblc;
}

