import request from 'superagent';
import { global } from 'metaform';

const apiBaseURL = window.apiBaseURL || '/api';

const websocketBaseURL = window.websocketBaseURL || 'http://localhost:7007';

var stompClient;

export function analyze(file) {
  return new Promise((resolve, reject) => {
    const req = request
      .post(apiBaseURL + '/sniff')
      .attach('file', file, file.name);
    call(resolve, reject, req, {parsefn: res => [res.text]});
  });
}

export function analyzeTable(conn, tableName) {
  return new Promise((resolve, reject) => {
    post(resolve, reject, apiBaseURL + '/tables/' + tableName, {data: conn});
  });
}

export function analyzeTables(tableDataSourceId, tables) {
  return new Promise((resolve, reject) => {
    //stompClient.send('/app/table-analysis-request', {}, JSON.stringify({
    //  dataSourceId: tableDataSourceId,
    //  tables: tables
    //}));
    //resolve();
    post(resolve, reject, apiBaseURL + '/table-data-sources/' + tableDataSourceId + '/analysis', {
      data: tables,
      isjson: true
    });
  });
}

export function showAnalysis(analysis) {
  return new Promise((resolve, reject) => resolve(analysis));
}

export function fetchAnalysis(dataSourceId) {
  return new Promise((resolve, reject) => {
    get(resolve, reject, apiBaseURL + '/data-sources/' + dataSourceId + '/analysis', {isjson: true});
  });
}

export function getTables(conn) {
  return new Promise((resolve, reject) => {
    post(resolve, reject, apiBaseURL + '/tables', {data: conn, isjson: true});
  });
}

export function getTablesForDataSource(dataSourceId) {
  return new Promise((resolve, reject) => {
    get(resolve, reject, apiBaseURL + '/table-data-sources/' + dataSourceId + '/tables', {isjson: true});
  });
}

export function getTreemap() {
  return new Promise((resolve, reject) => {
    get(resolve, reject, apiBaseURL + '/treemap', {isjson: true});
  });
}

export function getColumns() {
  return new Promise((resolve, reject) => {
    get(resolve, reject, apiBaseURL + '/column-list', {isjson: true});
  });
}

export function getComments(columnId) {
  return new Promise((resolve, reject) => {
    get(resolve, reject,
      apiBaseURL + '/comments/search/by-column?sort=created,desc&columnId=' + columnId,
      {isjson: true}
    );
  });
}

export function postComment(comment, columnId, datasetType) {
  return new Promise((resolve, reject) => {
    let columnUrl;
    if (datasetType == 'File') {
      columnUrl = `$apiBaseURL/file-columns/$columnId`;
    } else {
      columnUrl = `$apiBaseURL/table-columns/$columnId`;
    }
    const newComment = {
      comment: comment,
      column: columnUrl
    };
    const parsefn = res => {
      newComment.created = new Date();
      return newComment;
    };
    post(resolve, reject, apiBaseURL + '/comments', {
      data: newComment,
      parsefn
    });
  });
}

export function getTags(text) {
  return new Promise((resolve, reject) => {
    get(resolve, reject,
      apiBaseURL + '/tags/search/containing?text=' + text + '&sort=name', {
      parsefn: res => {
        let r = {};
        if (res.text.length) {
          r = JSON.parse(res.text);
        }
        return r;
      }
    });
  });
}

export function addTag(tag, columnId) {
  return new Promise((resolve, reject) => {
    post(resolve, reject, apiBaseURL + '/columns/' + columnId + '/tags/' + tag);
  });
}

export function removeTag(tag, columnId) {
  return new Promise((resolve, reject) => {
    del(resolve, reject, apiBaseURL + '/columns/' + columnId + '/tags/' + tag);
  });
}

export function getSources() {
  return new Promise((resolve, reject) => {
    get(resolve, reject, apiBaseURL + '/data-sources?size=999&sort=name', {isjson: true});
  });
}

export function authenticate(credentials) {
  return new Promise((resolve, reject) => {
    request.get(apiBaseURL + '/user')
      .auth(credentials.username, credentials.password)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          const user = JSON.parse(res.text);
          if (res.status !== 200) {
            reject(user.message);
          } else {
            const sessionId = res.header['x-auth-token'];
            if (sessionId) {
              localStorage.setItem('auth-token', sessionId);
            }
            resolve(user, credentials);
          }
        }
      });
  });
}

export function logout() {
  return new Promise((resolve, reject) => {
    post(resolve, reject, apiBaseURL + '/logout', {isjson: false});
    if (stompClient !== undefined) {
      stompClient.disconnect();
      console.log('Disconnected');
    }
    localStorage.removeItem('auth-token');
  });
}

export function subscribe(topic, requests) {
  return new Promise((resolve, reject) => {
    getStompClient().then(client => {
      client.subscribe(topic, (response) => {
        console.log("Received results of analysis request");
        const r = JSON.parse(response.body);
        requests[r.sourceName] = r;
        resolve(requests, r.datasets);
      });
    });
  });
}

export function disconnect() {
  return new Promise((resolve, reject) => {
    if (stompClient !== undefined) {
      stompClient.disconnect();
      console.log('Disconnected');
    }
    resolve();
  });
}

function getStompClient() {
  return new Promise((resolve, reject) => {
    if (stompClient === undefined) {
      const socket = new SockJS(websocketBaseURL + '/table-analysis-request');
      const client = Stomp.over(socket);
      stompClient = client;
      let headers = {};
      const sessionId = localStorage.getItem('auth-token');
      request.get(apiBaseURL + '/csrf')
        .set('x-auth-token', sessionId)
        .end((err, res) => {
          if (err) {
            reject(err);
          } else {
            const csrfToken = JSON.parse(res.text);
            headers[csrfToken.headerName] = csrfToken.token;
            client.connect(headers, frame => {
              console.log('Connected: ' + frame);
              resolve(client);
            });
          }
        });
    } else {
      resolve(stompClient);
    }
  });
}

function call(resolve, reject, req, {parsefn, isjson}) {
  // send AJAX request
  function send() {
    req.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        if (res.ok) {
          if (parsefn) {
            resolve(parsefn(res));
          } else if (isjson) {
            resolve(JSON.parse(res.text));
          } else {
            resolve(res.text);
          }
        } else {
          if (res.status === 401) {
            localStorage.removeItem('auth-token');
            global.setTimeout(() =>
              // TODO
              // define an interface for router
              // currently depends on react-router History object
              this.router.pushState(null, '/login')
            , 2000);
            let r = JSON.parse(res.text);
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
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          if (res.text.length) {
            const csrfToken = JSON.parse(res.text);
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
        }
      });
  }

  const mod = req.method != 'GET';
  const sessionId = localStorage.getItem('auth-token');
  req.set('x-auth-token', sessionId);
  mod ? csrf(send) : send();
  //let sessionId = localStorage.getItem('auth-token');
  //if (sessionId) {
  //  req.set('x-auth-token', sessionId);
  //  mod ? csrf(send) : send();
  //} else {
  //  // get session id
  //  request.get(apiBaseURL + '/token')
  //    .end((err, res) => {
  //      if (err) {
  //        reject(err);
  //      } else {
  //        const tokenObj = JSON.parse(res.text);
  //        sessionId = tokenObj.token;
  //        if (sessionId) {
  //          localStorage.setItem('auth-token', sessionId);
  //        }
  //        req.set('x-auth-token', sessionId);
  //        mod ? csrf(send) : send();
  //      }
  //    });
  //}
}

function post(resolve, reject, url, {data, parsefn, isjson}) {
  return call(resolve, reject, request.post(url).send(data), {parsefn, isjson});
}

function get(resolve, reject, url, {parsefn, isjson}) {
  return call(resolve, reject, request.get(url), {parsefn, isjson});
}

function del(resolve, reject, url, {parsefn, isjson}) {
  return call(resolve, reject, request.del(url), {parsefn, isjson});
}

function getCookie(name) {
  var regexp = new RegExp('(?:^' + name + '|;\\s*' + name + ')=(.*?)(?:;|$)', 'g');
  var result = regexp.exec(document.cookie);
  return (result === null) ? null : result[1];
}