package io.metamorphic.fileservices.controllers;

import akka.actor.ActorRef;
import akka.actor.ActorSystem;
import io.metamorphic.analysiscommons.models.DatabaseConnection;
import io.metamorphic.analysiscommons.models.DatasetMetrics;
import io.metamorphic.analysisservices.AnalysisService;
import io.metamorphic.fileservices.DatabaseAnalysisTask;
import io.metamorphic.fileservices.SpringExtension;
import io.metamorphic.fileservices.TableAnalysisMessage;
import io.metamorphic.fileservices.models.TableDatasetInfo;
import io.metamorphic.fileservices.repositories.*;
import metastore.models.DatabaseServerType;
import metastore.models.TableDataSource;
import metastore.models.TableDataset;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by markmo on 5/10/2015.
 */
@Controller
public class TableAnalysisController {

    private static final Log log = LogFactory.getLog(TableAnalysisController.class);

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private TableDataSourceRepository tableDataSourceRepository;

    @Autowired
    private TableDatasetRepository tableDatasetRepository;

    @Autowired
    protected MetricRepository metricRepository;

    @Autowired
    protected MetricValueRepository metricValueRepository;

    @Autowired
    private DatabaseAnalysisTaskDAO analysisTaskDAO;

    @Autowired
    private ActorSystem actorSystem;

    @Autowired
    private SpringExtension extension;

    @RequestMapping(value = "/api/table-data-sources/{tableDataSourceId}/tables", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> tableNames(@PathVariable("tableDataSourceId") Long tableDataSourceId) {
        TableDataSource ds = tableDataSourceRepository.findOne(tableDataSourceId);
        DatabaseConnection conn = new DatabaseConnection();
        conn.setName(ds.getName());
        conn.setHost(ds.getHostname());
        conn.setPort(ds.getPort());
        conn.setDbName(ds.getDatabaseName());
        conn.setSchema(ds.getSchemaName());
        String[] tables = analysisService.getTableNames(conn);
        Map<String, Object> response = new HashMap<>();
        response.put("tableDataSourceId", tableDataSourceId);
        response.put("tables", tables);
        return response;
    }

    @RequestMapping(value = "/api/tables", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> tableNames(@RequestBody DatabaseConnection conn) {
        Map<String, Object> response = new HashMap<>();
        TableDataSource tableDataSource;
        List<TableDataSource> matches = tableDataSourceRepository.findByName(conn.getName());
        List<String> selectedTables = new ArrayList<>();
        if (matches.isEmpty()) {
            tableDataSource = new TableDataSource();
            tableDataSource.setName(conn.getName());
            tableDataSource.setServerType(DatabaseServerType.valueOf(conn.getServerType()));
            tableDataSource.setServerVersion(conn.getServerVersion());
            tableDataSource.setHostname(conn.getHost());
            tableDataSource.setPort(conn.getPort());
            tableDataSource.setDatabaseName(conn.getDbName());
            tableDataSource.setSchemaName(conn.getSchema());
            tableDataSource.setUsername(conn.getUsername());
            tableDataSource.setPassword(conn.getPassword());
            tableDataSourceRepository.save(tableDataSource);
        } else {
            tableDataSource = matches.get(0);
            response.put("error", "Data Source already exists");
            List<TableDataset> tableDatasets = tableDatasetRepository.findByDataSourceId(tableDataSource.getId());
            for (TableDataset dataset : tableDatasets) {
                selectedTables.add(dataset.getName());
            }
        }
        String[] tableNames = analysisService.getTableNames(conn);
        List<Object[]> tables = new ArrayList<>();
        for (String name : tableNames) {
            int selected = 0;
            if (selectedTables.indexOf(name) != -1) {
                selected = 1;
            }
            tables.add(new Object[]{name, selected});
        }
        response.put("tableDataSourceId", tableDataSource.getId());
        response.put("tables", tables);
        return response;
    }

    @MessageMapping("/table-analysis-request")
    public void analyzeTables(TableAnalysisMessage message) throws Exception {
        if (log.isDebugEnabled()) {
            log.debug("analyzeTables from websocket message");
            log.debug(message);
        }
        ActorRef supervisor = actorSystem.actorOf(extension.props("supervisor").withMailbox("akka.priority-mailbox"));
        // start akka task
        TableDataSource dataSource = tableDataSourceRepository.findOne(message.getDataSourceId());
        DatabaseAnalysisTask task = new DatabaseAnalysisTask();
        task.setDataSource(dataSource);
        task.setConnection(getDatabaseConnection(dataSource));
        task.setTables(message.getTables());
        task.setPriority(1);
        supervisor.tell(task, null);
    }

    @RequestMapping(value = "/api/table-data-sources/{tableDataSourceId}/analysis", method = RequestMethod.POST)
    @ResponseBody
    public List<TableDatasetInfo> analyzeTables(@RequestBody List<String> tables,
                                                @PathVariable("tableDataSourceId") Long tableDataSourceId) {
        if (log.isDebugEnabled()) {
            log.debug("analyzeTables called with tableDataSourceId:" + tableDataSourceId);
        }
        TableDataSource tableDataSource = tableDataSourceRepository.findOne(tableDataSourceId);
        DatabaseConnection conn = getDatabaseConnection(tableDataSource);
        if (log.isDebugEnabled()) {
            log.debug(conn);
        }
        List<DatasetMetrics> datasetMetricsList = analysisService.analyze(conn.getDbName(), conn, tables);
        if (log.isDebugEnabled()) {
            log.debug("datasetMetricsList.size " + datasetMetricsList.size());
        }

        return analysisTaskDAO.create(tableDataSource, datasetMetricsList);
    }

    @RequestMapping(value = "/api/tables/{tableName}", method = RequestMethod.POST)
    @ResponseBody
    public DatasetMetrics analyzeTable(@RequestBody DatabaseConnection conn,
                                       @PathVariable("tableName") String tableName) {
        return analysisService.analyze(conn.getDbName(), conn, tableName);
    }

    private DatabaseConnection getDatabaseConnection(TableDataSource tableDataSource) {
        DatabaseConnection conn = new DatabaseConnection();
        conn.setServerType(tableDataSource.getServerType().toString());
        conn.setServerVersion(tableDataSource.getServerVersion());
        conn.setHost(tableDataSource.getHostname());
        conn.setPort(tableDataSource.getPort());
        conn.setDbName(tableDataSource.getDatabaseName());
        conn.setSchema(tableDataSource.getSchemaName());
        conn.setUsername(tableDataSource.getUsername());
        conn.setPassword(tableDataSource.getPassword());
        conn.setName(tableDataSource.getName());
        return conn;
    }
}
