import Fluxy from 'fluxy';
import * as $ from '../constants/app-constants';
import * as _ from '../services/app-service';

export default Fluxy.createActions({

  serviceActions: {

    analyze: [$.ANALYZE, file => _.analyze(file)],

    analyzeTable: [$.ANALYZE_TABLE, (conn, tableName) => _.analyzeTable(conn, tableName)],

    analyzeTables: [$.ANALYZE_TABLES, (tableDataSourceId, tables) => _.analyzeTables(tableDataSourceId, tables)],

    showAnalysis: [$.SHOW_ANALYSIS, analysis => _.showAnalysis(analysis)],

    getTables: [$.GET_TABLES, conn => _.getTables(conn)],

    getTablesForDataSource: [$.GET_TABLES_FOR_DATA_SOURCE, dataSourceId => _.getTablesForDataSource(dataSourceId)],

    fetchAnalysis: [$.FETCH_ANALYSIS, dataSourceId => _.fetchAnalysis(dataSourceId)],

    getTreemap: [$.GET_TREEMAP, () => _.getTreemap()],

    getColumns: [$.GET_COLUMNS, () => _.getColumns()],

    getComments: [$.GET_COMMENTS, columnId => _.getComments(columnId)],

    postComment: [$.POST_COMMENT, (comment, columnId) => _.postComment(comment, columnId)],

    getTags: [$.GET_TAGS, text => _.getTags(text)],

    addTag: [$.ADD_TAG, (tag, columnId) => _.addTag(tag, columnId)],

    removeTag: [$.REMOVE_TAG, (tag, columnId) => _.removeTag(tag, columnId)],

    getSources: [$.GET_SOURCES, () => _.getSources()],

    login: [$.LOGIN, credentials => _.authenticate(credentials)],

    logout: [$.LOGOUT, () => _.logout()],

    subscribe: [$.SUBSCRIBE, (topic, requests) => _.subscribe(topic, requests)],

    disconnect: [$.DISCONNECT, () => _.disconnect()]
  }
});