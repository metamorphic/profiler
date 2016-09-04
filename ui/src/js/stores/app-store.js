import Fluxy from 'fluxy';
import * as $ from '../constants/app-constants';
import { AppActions as _ } from 'metaform';

const mori = Fluxy.$;

export default Fluxy.createStore({

  getInitialState() {
    return {
      requests: null,
      analysis: null,
      tables: null,
      treemap: null,
      columns: [],
      comments: [],
      tags: [],
      sources: [],
      user: null
    };
  },

  actions: [

    [$.ANALYZE_COMPLETED, function (analysis) { this.set('analysis', analysis) }],

    [$.ANALYZE_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.ANALYZE_TABLE_COMPLETED, function (analysis) { this.set('analysis', analysis) }],

    [$.ANALYZE_TABLE_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.ANALYZE_TABLES_COMPLETED, function (analysis) { this.set('analysis', analysis) }],

    [$.ANALYZE_TABLES_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.SHOW_ANALYSIS_COMPLETED, function (analysis) { this.set('analysis', analysis) }],

    [$.SHOW_ANALYSIS_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.FETCH_ANALYSIS_COMPLETED, function (analysis) { this.set('analysis', analysis) }],

    [$.FETCH_ANALYSIS_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.GET_TABLES_COMPLETED, function (tables) { this.set('tables', tables) }],

    [$.GET_TABLES_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.GET_TABLES_FOR_DATA_SOURCE_COMPLETED, function (tables) { this.set('tables', tables) }],

    [$.GET_TABLES_FOR_DATA_SOURCE_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.GET_TREEMAP_COMPLETED, function (treemap) { this.set('treemap', treemap) }],

    [$.GET_TREEMAP_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.GET_COLUMNS_COMPLETED, function (columns) { this.set('columns', columns) }],

    [$.GET_COLUMNS_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.GET_COMMENTS_COMPLETED, function (comments) { this.set('comments', comments) }],

    [$.GET_COMMENTS_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.POST_COMMENT_COMPLETED, function (newComment) {
      const comments = mori.js_to_clj(this.get('comments'));
      this.set('comments',
        mori.assoc_in(comments, ['_embedded', 'comments'],
          mori.cons(newComment, mori.get_in(comments, ['_embedded', 'comments']))
        )
      );
    }],

    [$.POST_COMMENT_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.GET_TAGS_COMPLETED, function (tags) { this.set('tags', tags) }],

    [$.GET_TAGS_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.ADD_TAG_COMPLETED, function (resp) { }],

    [$.ADD_TAG_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.REMOVE_TAG_COMPLETED, function (resp) { }],

    [$.REMOVE_TAG_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.GET_SOURCES_COMPLETED, function (sources) { this.set('sources', sources) }],

    [$.GET_SOURCES_FAILED, function (err) { _.alert({error: err, message: err}) }],

    [$.LOGIN_COMPLETED, function (user, credentials) {
      this.set('user', user);
      this.set('credentials', credentials);
    }],

    [$.LOGIN_FAILED, function (err) {
      this.set('user', null);
      _.alert({error: err, message: err});
    }],

    [$.LOGOUT_COMPLETED, function () { this.set('user', null) }],

    [$.LOGOUT_FAILED, function (err) {
      this.set('user', null);
      _.alert({error: err, message: err});
    }],

    [$.SUBSCRIBE_COMPLETED, function (requests, analysis) {
      this.set('requests', requests);
      this.set('analysis', analysis);
    }],

    [$.SUBSCRIBE_FAILED, function (err) {
      this.set('requests', null);
      this.set('analysis', null);
      _.alert({error: err, message: err});
    }]
  ],

  getRequests: function () { return this.getAsJS('requests') },

  getAnalysis: function () { return this.getAsJS('analysis') },

  getTables: function () { return this.getAsJS('tables') },

  getTreemap: function () { return this.getAsJS('treemap') },

  getColumns: function () { return this.getAsJS('columns') },

  getComments: function () { return this.getAsJS('comments') },

  getTags: function () { return this.getAsJS('tags') },

  getSources: function () { return this.getAsJS('sources') },

  getUser: function () { return this.getAsJS('user') },

  isAuthenticated: function () { return !!this.getAsJS('user') },

  getCredentials: function () { return this.getAsJS('credentials') }

});