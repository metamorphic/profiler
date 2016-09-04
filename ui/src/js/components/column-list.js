import React from 'react';
import StoreWatchMixin from '../mixins/store-watch-mixin';
import AppStore from '../stores/app-store';
import * as AppActions from '../actions/app-actions';
import TopNavigation from './top-navigation';
import RemoteModel from './remote-model';
import CheckboxList from './checkbox-list';
import moment from 'moment';
import $ from 'jquery';

const TAGS_LOADED = 1;    // 01
const SOURCES_LOADED = 2; // 10
var flags = 0;

export default React.createClass({

  mixins: [
    StoreWatchMixin(getComments),
    StoreWatchMixin(getTags),
    StoreWatchMixin(getSources)
  ],

  getInitialState() {
    return {
      selectedItem: {}
    };
  },

  componentDidMount() {
    const columns = [
      {id: 'name', name: 'Name', field: 'name', minWidth: 160, sortable: true},
      {id: 'datasetType', name: 'Type', field: 'datasetType'},
      {id: 'dataSource', name: 'Source', field: 'dataSourceName'},
      {id: 'dataset', name: 'Dataset', field: 'datasetName'},
      {id: 'registered', name: 'Registered', field: 'registered', minWidth: 100, formatter: dateFormatter, sortable: true},
      {id: 'tags', name: 'Tags', field: 'tags'},
      {id: 'uniqueness', name: 'Uniqueness', field: 'uniqueness'},
      {id: 'completeness', name: 'Completeness', field: 'completeness'},
      {id: 'cardinality', name: 'Cardinality', field: 'cardinality'},
      {id: 'records', name: 'Records', field: 'records'}
    ];
    const options = {
      enableColumnReorder: false,
      fullWidthRows: true,
      editable: false,
      enableAddRow: false,
      enableCellNavigation: false
    };
    const loader = RemoteModel;
    let grid = new Slick.Grid('#myGrid', loader.data, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel());
    const pager = new Slick.Controls.Pager(loader, grid, $('#pager'));

    grid.onViewportChanged.subscribe(() => {
      const vp = grid.getViewport();
      loader.ensureData(vp.top, vp.bottom);
    });

    grid.onSort.subscribe((e, args) => {
      let sortField = args.sortCol.field;
      if (sortField == 'registered') {
        sortField = 'created';
      }
      loader.setSort(sortField, args.sortAsc ? 1 : -1);
      const vp = grid.getViewport();
      loader.ensureData(vp.top, vp.bottom);
    });

    loader.onDataLoading.subscribe(() => {
      if (!this.loadingIndicator) {
        this.loadingIndicator = $('<span class="loading-indicator"><label>Buffering...</label></span>').appendTo(document.body);
        const $g = $('#myGrid').parent();
        this.loadingIndicator
          .css('position', 'absolute')
          .css('top', $g.position().top + $g.height() / 2 - this.loadingIndicator.height() / 2)
          .css('left', $g.position().left + $g.width() / 2 - this.loadingIndicator.width() / 2);
      }
      this.loadingIndicator.show();
    });

    loader.onDataLoaded.subscribe((e, args) => {
      for (let i = args.from; i <= args.to; i++) {
        grid.invalidateRow(i);
      }
      grid.updateRowCount();
      grid.render();
      if (this.loadingIndicator) this.loadingIndicator.fadeOut();
    });

    grid.onClick.subscribe(e => {
      e.stopPropagation();
      const cell = grid.getCellFromEvent(e);
      const selectedItem = loader.data[cell.row];
      if (selectedItem.index != this.state.selectedItem.index) {
        this.setState({ selectedItem });
        grid.setSelectedRows([cell.row]);
        AppActions.getComments(selectedItem.id);
        this.updateTags();
      }
    });

    grid.onViewportChanged.notify();

    let textarea = this.refs.commentBox.getDOMNode();
    const heightLimit = 200;

    textarea.oninput = () => {
      textarea.style.height = ''; // Reset the height
      let scrollHeight = textarea.scrollHeight;
      if (scrollHeight < 41) {
        scrollHeight = 41;
      }
      textarea.style.height = Math.min(scrollHeight, heightLimit) + 'px';
      $(this.refs.commentBtn.getDOMNode()).show();
    };

    textarea.onblur = () => {
      if (textarea.value == '' && textarea.style.display != 'none') {
        $(this.refs.commentBtn.getDOMNode()).hide();
      }
    };

    const suggest = this.refs.suggest.getDOMNode();
    $(this.refs.tags.getDOMNode()).pillbox({
      onKeyDown: (e, callback) => {
        setTimeout(() => {
          const text = suggest.value && suggest.value.trim();
          if (text && text.length) {
            AppActions.getTags(text).then(() => {
              const resp = AppStore.getTags();
              let items = [];
              if (resp._embedded) {
                const tags = resp._embedded.tags;
                items = createItems(tags);
              }
              callback({ data: items });
            });
          }
        }, 0);
      },
      onAdd: (data, callback) => {
        const selectedItem = this.state.selectedItem;
        if (selectedItem) {
          AppActions.addTag(data.text, selectedItem.id);
          let tags = selectedItem.tags;
          if (tags && tags.length) {
            tags += ', ' + data.text;
          } else {
            tags = data.text;
          }
          selectedItem.tags = tags;
          grid.invalidateRow(selectedItem.index);
          grid.render();
          this.setState({ selectedItem });
          callback(data);
        }
      },
      onRemove: (data, callback) => {
        const selectedItem = this.state.selectedItem;
        if (selectedItem) {
          AppActions.removeTag(data.text, selectedItem.id);
          let tagList = selectedItem.tags.split(', ');
          tagList.splice(tagList.indexOf(data.text), 1);
          selectedItem.tags = tagList.join(', ');
          grid.invalidateRow(selectedItem.index);
          grid.render();
          this.setState({ selectedItem });
          callback(data);
        }
      }
    });
    this.updateTags();
    this.loader = loader;
    this.grid = grid;

    AppActions.getTags('').then(() => flags |= TAGS_LOADED);
    AppActions.getSources().then(() => flags |= SOURCES_LOADED);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return !!(flags & (TAGS_LOADED | SOURCES_LOADED));
  },

  updateTags() {
    const $el = $(this.refs.tags.getDOMNode());
    $el.pillbox('removeItems');
    const tags = this.state.selectedItem.tags;
    if (tags && tags.length) {
      const tagList = tags.split(', ');
      $el.pillbox('addItems', tagList.map((tag) => ({
        text: tag,
        value: tag,
        attr: {},
        data: {}
      })));
    }
  },

  postComment() {
    const selectedItem = this.state.selectedItem;
    const commentBox = this.refs.commentBox.getDOMNode();
    const value = commentBox.value;
    if (value && selectedItem) {
      AppActions.postComment(value, selectedItem.id);
    }
    commentBox.value = '';
    $(this.refs.commentBtn.getDOMNode()).hide();
  },

  toggleTagsComponent() {
    const tagsComponent = this.refs.tags.getDOMNode();
    $(tagsComponent).toggle();
  },

  handleTagFilterChange(e, key, value) {
    this.tagItemMap[key].checked = value;
    this.loader.setTag(checkedItems(this.tagItemMap).join(','));
    const vp = this.grid.getViewport();
    this.loader.ensureData(vp.top, vp.bottom);
  },

  handleSourceFilterChange(e, key, value) {
    this.sourceItemMap[key].checked = value;
    this.loader.setSource(checkedItems(this.sourceItemMap).join(','));
    const vp = this.grid.getViewport();
    this.loader.ensureData(vp.top, vp.bottom);
  },

  render() {
    const selectedItem = this.state.selectedItem;
    const commentsResp = this.state.comments;
    let comments = [];
    if (commentsResp && commentsResp._embedded) {
      comments = commentsResp._embedded.comments;
    }
    const detailsSidebar = (
      <div className="col-md-2 sidebar"
           style={{ display: (Object.keys(selectedItem).length ? 'block' : 'none') }}>
        <div className="column-name">{selectedItem.name}</div>
        <div className="tags-component">
          <div><a href="#" onClick={this.toggleTagsComponent}>Edit Tags</a></div>
          <div className="pillbox" data-initialize="pillbox" ref="tags">
            <ul className="clearfix pill-group">
              <li className="pillbox-input-wrap btn-group">
                <a className="pillbox-more">and <span className="pillbox-more-count"/> more...</a>
                <input ref="suggest" type="text" className="form-control dropdown-toggle pillbox-add-item" placeholder="add item"/>
                <button type="button" className="dropdown-toggle sr-only">
                  <span className="caret"/>
                  <span className="sr-only">Toggle Dropdown</span>
                </button>
                <ul className="suggest dropdown-menu" role="menu" data-toggle="dropdown" data-flip="auto"/>
              </li>
            </ul>
          </div>
        </div>
        <div className="detail-group small">
          <div>{selectedItem.registered ? 'Discovered' : ''}</div>
          <div>{moment(selectedItem.registered).format('D/M/YY h:mm A')}</div>
        </div>
        <div className="detail-group small">
          <div className="clearfix">
            <div className="key">Uniqueness</div>
            <div className="value">{selectedItem.uniqueness}</div>
          </div>
          <div className="clearfix">
            <div className="pull-left">Records</div>
            <div className="pull-right">{selectedItem.records}</div>
          </div>
          <div className="clearfix">
            <div className="pull-left">Completeness</div>
            <div className="pull-right">{selectedItem.completeness}</div>
          </div>
          <div className="clearfix">
            <div className="pull-left">Cardinality</div>
            <div className="pull-right">{selectedItem.cardinality}</div>
          </div>
        </div>
        <div className="detail-group comment">
          <textarea ref="commentBox" placeholder="Write a comment..." rows="1"/>
          <div ref="commentBtn" className="comment-button" onClick={this.postComment}>Comment</div>
          <div className="user-comments">
            {comments.map((comment, i) =>
              (
                <div key={'comment' + (i + 1)} className="user-comment small">
                  <div>You</div>
                  <div className="tiny">{moment(comment.created).fromNow()}</div>
                  <div className="text">{comment.comment}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
    const tags = this.state.tags;
    this.tagItemMap = createItemMap(tags);
    const sources = this.state.sources;
    this.sourceItemMap = createItemMap(sources);
    return (
      <div className="column-list">
        <div className="row no-gutters header">
          <div className="col-md-2 sidebar">
            Filter
          </div>
          <div className="col-md-8">
            <TopNavigation/>
          </div>
          <div className="col-md-2 sidebar">
            Details
          </div>
        </div>
        <div className="row no-gutters body">
          <div className="col-md-2 sidebar">
            <div>Tags</div>
            <CheckboxList items={tags} selectAll={false}
                          onChange={this.handleTagFilterChange}/>
            <div>Sources</div>
            <CheckboxList items={sources} selectAll={false}
                          onChange={this.handleSourceFilterChange}/>
          </div>
          <div className="col-md-8">
            <div id="myGrid"></div>
            <div id="pager"></div>
          </div>
          {detailsSidebar}
        </div>
      </div>
    );
  }
});

function getColumns() {
  return {
    columns: AppStore.getColumns()
  }
}

function getComments() {
  return {
    comments: AppStore.getComments()
  }
}

function getTags() {
  const resp = AppStore.getTags();
  let tags = [];
  if (resp && resp._embedded) {
    tags = map(resp._embedded.tags, convertToCheckboxListItem);
  }
  return { tags };
}

function getSources() {
  const resp = AppStore.getSources();
  let sources = [];
  if (resp && resp._embedded) {
    const tableSources = resp._embedded['table-data-sources'];
    if (tableSources) {
      sources = sources.concat(map(tableSources, convertToCheckboxListItem));
    }
    const fileSources = resp._embedded['file-data-sources'];
    if (fileSources) {
      sources = sources.concat(map(fileSources, convertToCheckboxListItem));
    }
  }
  return { sources };
}

function dateFormatter(row, cell, value, columnDef, dataContext) {
  if (value == null) return null;
  return moment(value).format('D/M/YY h:mm A');
}

function createItemMap(items) {
  let item, itemMap = {};
  for (let i = 0; i < items.length; i++) {
    item = items[i];
    itemMap[item.key] = item;
  }
  return itemMap;
}

function checkedItems(itemMap) {
  let items = [];
  for (let key in itemMap) {
    if (itemMap.hasOwnProperty(key)) {
      if (itemMap[key].checked) {
        items.push(key);
      }
    }
  }
  return items;
}

function createItems(objs) {
  return objs.map(obj => {
    const href = obj._links.self.href;
    let end = href.lastIndexOf('{');
    if (end === -1) {
      end = href.length;
    }
    const id = href.substring(href.lastIndexOf('/') + 1, end);
    return {
      text: obj.name,
      value: id,
      attr: {},
      data: {}
    };
  });
}

function convertToCheckboxListItem(obj) {
  const href = obj._links.self.href;
  let end = href.lastIndexOf('{');
  if (end === -1) {
    end = href.length;
  }
  const id = href.substring(href.lastIndexOf('/') + 1, end);
  return {
    key: id,
    label: obj.name,
    checked: false
  };
}

function map(array, fn) {
  if (array == null || array.length == 0) return array;
  let result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i]));
  }
  return result;
}
