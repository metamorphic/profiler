var Promise = require('bluebird');
var request = require('superagent');
var pluralize = require('pluralize');
var jsonPath = require('JSONPath');
var global = require('../global');

var apiBaseURL = global.apiBaseURL || '/api';

function createMenuItems(objs) {
  return objs.map(function (obj) {
    var id = obj['_links'].self.href;

    // remove the optional parts of the url
    var i = id.indexOf('{');
    if (i > 0) {
      id = id.substring(0, i);
    }
    return {
      value: id,
      label: obj.name
    };
  });
}

function getKeyForSource(source) {
  if (source) {
    var i = source.lastIndexOf('/') + 1;
    return source.substring(i);
  }
  return source;
}

module.exports = {

  getFormSchema: function (name) {
    return new Promise(function (resolve, reject) {
      get(resolve, reject, apiBaseURL + '/form-schemas/search/findByName?name=' + name, {
        parsefn: function (res) {
          if (res.ok) {
            var json = JSON.parse(res.text);
            resolve(JSON.parse(json['_embedded']['form-schemas'][0].schema));
          } else {
            var json = JSON.parse(res.text);
            var message = jsonPath.eval(json, '$..message').join('; ');
            reject({error: message, message: message});
          }
        }
      })
    });
  },

  createEntity: function (type, data) {
    return new Promise(function (resolve, reject) {
      post(resolve, reject, apiBaseURL + '/' + pluralize(type), {
        data: data,
        parsefn: function (res) {
          if (res.ok) {
            resolve();
          } else {
            var json = JSON.parse(res.text);
            var message = jsonPath.eval(json, '$..message').join('; ');
            reject({error: message, message: message});
          }
        }
      })
    });
  },

  updateEntity: function (link, data) {
    return new Promise(function (resolve, reject) {
      patch(resolve, reject, link, {
        data: data,
        parsefn: function (res) {
          if (res.ok) {
            resolve();
          } else {
            var json = JSON.parse(res.text);
            var message = jsonPath.eval(json, '$..message').join('; ');
            reject({error: message, message: message});
          }
        }
      });
    });
  },

  deleteEntities: function (links) {
    return new Promise(function (resolve, reject) {
      var k = links.length;
      for (var i = 0; i < links.length; i++) {
        del(resolve, reject, links[i], {
          parsefn: function (res) {
            if (res.ok) {
              k -= 1;
              if (k === 0) {
                resolve();
              }
            } else {
              if (err) {
                reject(err);
              } else {
                var json = JSON.parse(res.text);
                var message = jsonPath.eval(json, '$..message').join('; ');
                reject({error: message, message: message});
              }
            }
          }
        });
      }
    });
  },

  getEntity: function (type, id) {
    return new Promise(function (resolve, reject) {
      var link = apiBaseURL + '/' + type + '/' + id + '?projection=grid';
      get(resolve, reject, link, {
        parsefn: function (res) {
          if (res.ok) {
            resolve(JSON.parse(res.text));
          } else {
            var json = JSON.parse(res.text);
            var message = jsonPath.eval(json, '$..message').join('; ');
            reject({error: message, message: message});
          }
        }
      });
    });
  },

  saveValue: function (type, id, field, value) {
    return new Promise(function (resolve, reject) {
      var link = apiBaseURL + '/' + type + '/' + id;
      var data = {};
      data[field] = value;
      patch(resolve, reject, link, {
        data: data,
        parsefn: function (res) {
          if (res.ok) {
            resolve();
          } else {
            var json = JSON.parse(res.text);
            var message = jsonPath.eval(json, '$..message').join('; ');
            reject({error: message, message: message});
          }
        }
      });
    });
  },

  getSelectOptions: function (source, q, async) {
    return new Promise(function (resolve, reject) {
      var obj = {};
      var key;
      if (async) {
        key = source.match(/\/([\w-]+)\/search/)[1];
      } else {
        key = getKeyForSource(source);
      }
      if (async && !q) {
        obj[key] = [];
        resolve(obj);
      } else {
        get(resolve, reject,
          source.replace('$ds1url', apiBaseURL) + (async ? q + '&' : '?') + 'size=99999', {
          parsefn: function (res) {
            var json = JSON.parse(res.text);
            var rows = [];
            var totalEntries = json.page.totalElements;
            var parts = source.split('/');
            var type = parts[parts.length - (async ? 3 : 1)];
            if (totalEntries > 0) {
              var types = Object.keys(json['_embedded']);
              // if (types.length > 1) {
              for (var i = 0; i < types.length; i++) {
                Array.prototype.push.apply(rows, json['_embedded'][types[i]]);
              }
              // } else {
              //   rows = json['_embedded'][type];
              // }
            }
            var menuItems;
            if (rows && rows.length) {
              menuItems = createMenuItems(rows);
            } else {
              menuItems = [];
            }
            obj[key] =  menuItems;
            return obj;
          }
        });
      }
    });
  },

  getPillboxOptions: function (source) {
    return new Promise(function (resolve, reject) {
      get(resolve, reject, source, {
        parsefn: function (res) {
          return {data: createItems(res.body)};
        }
      });
    });
  },

  fetchPage: function (entity, sourceTemplate, filter, filterParam, view, page, pageSize, sortBy, order, q) {
    return new Promise(function (resolve, reject) {
      var source = sourceTemplate.replace('$ds1url', apiBaseURL);
      if (filter && (filterParam || q)) {
        source += '/search/' + filter + '?';
        if (!q) q = '';
        if (filterParam) {
          source += filterParam + '&q=' + q;
        } else {
          source += 'q=' + q;
        }
        source += '&';
      } else {
        source += '?';
      }
      if (view) {
        source += 'projection=' + view + '&';
      }
      source += 'page=' + (page - 1) + '&size=' + pageSize;
      source += '&sort=' + sortBy + ',' + order;
      get(resolve, reject, source, {
        parsefn: function (res) {
          var json = JSON.parse(res.text);
          var totalEntries = json.page.totalElements;
          var rows = [];
          if (totalEntries > 0) {
            rows = json['_embedded'][pluralize(entity)];
          }
          return {
            totalEntries: totalEntries,
            rows: rows
          };
        }
      });
    });
  }
};

function createItems(objs) {
  var items = objs.map(function (obj) {
    return {
      text: obj.name,
      value: obj.id + '',
      attr: {},
      data: {}
    };
  });
  return items;
}

function call(resolve, reject, req, opts) {
  // send AJAX request
  function send() {
    req.end(function (err, res) {
      if (err) {
        reject(err);
      } else {
        if (res.ok) {
          if (opts.parsefn) {
            resolve(opts.parsefn(res));
          } else if (opts.isjson) {
            resolve(JSON.parse(res.text));
          } else {
            resolve(res.text);
          }
        } else {
          if (res.status === 401) {
            localStorage.removeItem('auth-token');
            global.setTimeout(function() {
              // TODO
              // define an interface for router
              // currently depends on react-router History object
              this.router.pushState(null, '/login');
            }, 2000);
            var r = JSON.parse(res.text);
            r.originalMessage = r.message;
            r.message = 'You have been logged out on the server, and will be redirected to login shortly.';
            reject(r);
          } else {
            reject(JSON.parse(res.text));
          }
        }
      }
    });
  }

  // get CSRF token
  function csrf(fn) {
    request.get(apiBaseURL + '/csrf')
      .set('x-auth-token', sessionId)
      .end(function (err, res) {
        if (err) {
          reject(err);
        } else {
          if (res.text.length) {
            var csrfToken = JSON.parse(res.text);
            if (csrfToken && csrfToken.hasOwnProperty('headerName')) {
              req.set(csrfToken.headerName, csrfToken.token);
              fn();
            } else {
              reject({
                error: 'No CSRF Token',
                message: 'No CSRF Token'
              });
            }
          }
          fn();
        }
      });
  }

  var mod = req.method != 'GET';
  var sessionId = localStorage.getItem('auth-token');
  if (sessionId) {
    req.set('x-auth-token', sessionId);
    mod ? csrf(send) : send();
  } else {
    // get session id
    var credentials = global.credentials;
    request.get(apiBaseURL + '/token')
      .auth(credentials.username, credentials.password)
      .end(function (err, res) {
        if (err) {
          reject(err);
        } else {
          token = JSON.parse(res.text);
          req.set('x-auth-token', token);
          mod ? csrf(send) : send();
        }
      });
  }
}

function post(resolve, reject, url, opts) {
  return call(resolve, reject, request.post(url).send(opts.data), {
    parsefn: opts.parsefn,
    isjson: opts.isjson
  });
}

function patch(resolve, reject, url, opts) {
  return call(resolve, reject, request.patch(url).send(opts.data), {
    parsefn: opts.parsefn,
    isjson: opts.isjson
  });
}

function get(resolve, reject, url, opts) {
  return call(resolve, reject, request.get(url), {
    parsefn: opts.parsefn,
    isjson: opts.isjson
  });
}

function del(resolve, reject, url, opts) {
  return call(resolve, reject, request.del(url), {
    parsefn: opts.parsefn,
    isjson: opts.isjson
  });
}

function getCookie(name) {
  var regexp = new RegExp('(?:^' + name + '|;\\s*' + name + ')=(.*?)(?:;|$)', 'g');
  var result = regexp.exec(document.cookie);
  return (result === null) ? null : result[1];
}
