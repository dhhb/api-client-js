import request from 'superagent';
import superagentJsonapify from 'superagent-jsonapify';
import { EventEmitter } from 'events';

superagentJsonapify(request);

class ApiEmitter extends EventEmitter {}

export default function createAPIClient (_apiUrl) {
  const apiVersion = 1;
  const apiUrl = `${_apiUrl}/v${apiVersion}`;

  const prvt = {};
  const pblc = {
    apiUrl,
    apiVersion,
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

  prvt.parseJsonApiError = (err = {}) => {
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

  prvt.request = (resource, method = 'GET', query, params) => {
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

          reject(prvt.parseJsonApiError(err));
        });
    });
  };

  prvt.createQuery = (opts) => {
    const query = {};

    if (Array.isArray(opts.include)) {
      query.include = opts.include.join(',');
    }

    if (opts.filter) {
      query.filter = { ...opts.filter };
    }

    return query;
  };

  // Authentication
  pblc.setSession = (tokenId) => {
    sessionTokenId = tokenId;

    return pblc;
  };

  // Tokens
  pblc.authorize = (creds) => {
    return prvt.request('/token', 'POST', {}, prvt.createJsonApiRecord('token', creds));
  };

  pblc.unauthorize = (id) => {
    return prvt.request(`/token/${id}`, 'DELETE');
  };

  // aliases
  pblc.login = pblc.authorize;
  pblc.logout = pblc.unauthorize;

  // Users
  pblc.getUsers = (opts = {}) => {
    return prvt.request('/users', 'GET', prvt.createQuery(opts));
  };

  pblc.getUser = (id, opts = {}) => {
    return prvt.request(`/users/${id}`, 'GET', prvt.createQuery(opts));
  };

  pblc.createUser = (data) => {
    return prvt.request('/users', 'POST', {}, prvt.createJsonApiRecord('users', data));
  };

  pblc.updateUser = (data, id) => {
    return prvt.request(`/users/${id}`, 'PATCH', {}, prvt.createJsonApiRecord('users', id, data));
  };

  pblc.deleteUser = (id) => {
    return prvt.request(`/users/${id}`, 'DELETE');
  };

  // Articles
  pblc.getArticles = (opts = {}) => {
    return prvt.request('/articles', 'GET', prvt.createQuery(opts));
  };

  pblc.getArticle = (id, opts = {}) => {
    return prvt.request(`/articles/${id}`, 'GET', prvt.createQuery(opts));
  };

  pblc.createArticle = (data) => {
    return prvt.request('/articles', 'POST', {}, prvt.createJsonApiRecord('articles', data));
  };

  pblc.updateArticle = (data, id) => {
    return prvt.request(`/articles/${id}`, 'PATCH', {}, prvt.createJsonApiRecord('articles', id, data));
  };

  pblc.deleteArticle = (id) => {
    return prvt.request(`/articles/${id}`, 'DELETE');
  };

  // Categories
  pblc.getCategories = (opts = {}) => {
    return prvt.request('/categories', 'GET', prvt.createQuery(opts));
  };

  pblc.getCategory = (id, opts = {}) => {
    return prvt.request(`/categories/${id}`, 'GET', prvt.createQuery(opts));
  };

  pblc.createCategory = (data) => {
    return prvt.request('/categories', 'POST', {}, prvt.createJsonApiRecord('categories', data));
  };

  pblc.updateCategory = (data, id) => {
    return prvt.request(`/categories/${id}`, 'PATCH', {}, prvt.createJsonApiRecord('categories', id, data));
  };

  pblc.deleteCategory = (id) => {
    return prvt.request(`/categories/${id}`, 'DELETE');
  };

  return pblc;
}
