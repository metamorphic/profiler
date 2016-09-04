window.$ = window.jQuery = require('jquery');

var baseURL = 'http://localhost:7001/api/column-list';

var credentials = {username: 'user', password: 'password'};

var data = [];
var pageSize;
var pageNumber = 0;
var totalElements = 0;
var req = null; // current AJAX request
var timer = null;
var sortCol = null;
var sortDir = 1;
var tag = null;
var source = null;

var onDataLoading = new Slick.Event();
var onDataLoaded = new Slick.Event();
var onPagingInfoChanged = new Slick.Event();

function init() {}

function isDataLoaded(from, to) {
  for (var i = from; i <= to; i++) {
    if (data[i] == undefined || data[i] == null) {
      return false;
    }
  }
  return true;
}

function clear() {
  for (var key in data) {
    delete data[key];
  }
  data.length = 0;
}

function ensureData(from, to) {
  if (pageSize == undefined) {
    pageSize = to;
  }
  if (req) {
    req.abort();
    for (var i = req.fromPage; i <= req.toPage; i++) {
      data[i * pageSize] = undefined;
    }
  }
  if (from < 0) {
    from = 0;
  }
  //if (data.length > 0) {
  //  to = Math.min(to, data.length - 1);
  //}
  var fromPage = Math.floor(from / pageSize);
  var toPage = Math.floor(to / pageSize);
  while (data[fromPage * pageSize] !== undefined && fromPage < toPage) {
    fromPage += 1;
  }
  while (data[toPage * pageSize] !== undefined && fromPage < toPage) {
    toPage -= 1;
  }
  if (fromPage > toPage || ((fromPage == toPage) && data[fromPage * pageSize] !== undefined)) {
    onDataLoaded.notify({from: from, to: to});
    return;
  }
  var url = baseURL + '?page=' + fromPage + '&size=' + pageSize;
  if (sortCol != null) {
    url += '&sort=' + sortCol + ',' + (sortDir > 0 ? 'asc' : 'desc');
  }
  if (tag != null) {
    url += '&tag=' + tag;
  }
  if (source != null) {
    url += '&source=' + source;
  }
  timer = setTimeout(function () {
    //for (var i = fromPage; i <= toPage; i++) {
    //  data[i * pageSize] = null; // null indicates a 'requested but not available yet'
    //}
    onDataLoading.notify({from: from, to: to});
    var headers = credentials ? {
      authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
    } : {};
    req = $.ajax({
      url: url,
      headers: headers,
      cache: true,
      success: onSuccess,
      error: function () {
        onError(fromPage, toPage);
      }
    });
    req.fromPage = fromPage;
    req.toPage = toPage;
  }, 50);
}

function onError(fromPage, toPage) {
  console.log('Error loading pages ' + fromPage + ' to ' + toPage);
}

function onSuccess(resp) {
  var items = [];
  if (resp._embedded) {
    items = resp._embedded.columnListItems;
  }
  var pageInfo = resp.page;
  var from = pageInfo.number * pageInfo.size;
  var to = from + items.length;
  totalElements = pageInfo.totalElements;
  var j;
  for (var i = 0; i < items.length; i++) {
    j = from + i;
    data[j] = items[i];
    data[j].index = j;
  }
  req = null;
  pageNumber = Math.ceil(data.length / pageSize) - 1;
  onDataLoaded.notify({from: from, to: to});
  onPagingInfoChanged.notify(getPagingInfo());
}

function reloadData(from, to) {
  for (var i = from; i <= to; i++) {
    delete data[i];
  }
  ensureData(from, to);
}

function setSort(column, dir) {
  sortCol = column;
  sortDir = dir;
  clear();
}

function setTag(value) {
  tag = value;
  clear();
}

function setSource(value) {
  source = value;
  clear();
}

function setPagingOptions(options) {
  if (options.pageSize != undefined) {
    pageSize = options.pageSize;
    pageNumber = pageSize ? Math.min(pageNumber, Math.max(1, Math.ceil(totalElements / pageSize) - 1)) : 1;
  }
  if (options.pageNum != undefined) {
    pageNumber = Math.min(options.pageNum, Math.max(1, Math.ceil(totalElements / pageSize) - 1));
  }
  //onPagingInfoChanged.notify(getPagingInfo());
  var from = pageNumber * pageSize;
  var to = from + pageSize;
  ensureData(from, to);
}

function getPagingInfo() {
  var totalPages = pageSize ? Math.max(1, Math.ceil(totalElements / pageSize)) : 1;
  return {
    pageSize: pageSize,
    pageNum: pageNumber,
    totalRows: totalElements,
    totalPages: totalPages
  };
}

function getRowCount() {
  return data.length;
}

init();

var RemoteModel = {
  // properties
  data: data,

  // methods
  clear: clear,
  isDataLoaded: isDataLoaded,
  ensureData: ensureData,
  reloadData: reloadData,
  setSort: setSort,
  setTag: setTag,
  setSource: setSource,
  setPagingOptions: setPagingOptions,
  getPagingInfo: getPagingInfo,
  getRowCount: getRowCount,

  // events
  onDataLoading: onDataLoading,
  onDataLoaded: onDataLoaded,
  onPagingInfoChanged: onPagingInfoChanged
};

$.extend(true, window, {Slick:{Data:{RemoteModel: RemoteModel}}});

module.exports = RemoteModel;