package io.metamorphic.fileservices.actors;

import akka.actor.UntypedActor;
import akka.event.Logging;
import akka.event.LoggingAdapter;
import io.metamorphic.analysiscommons.models.DatabaseConnection;
import io.metamorphic.analysiscommons.models.DatasetMetrics;
import io.metamorphic.analysisservices.AnalysisService;
import io.metamorphic.fileservices.DatabaseAnalysisTask;
import io.metamorphic.fileservices.models.Analysis;
import io.metamorphic.fileservices.models.TableDatasetInfo;
import io.metamorphic.fileservices.repositories.DatabaseAnalysisTaskDAO;
import metastore.models.AnalysisStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by markmo on 6/10/2015.
 */
@Component
@Scope("prototype")
public class DatabaseAnalysisTaskActor extends UntypedActor {

    private final LoggingAdapter log = Logging.getLogger(getContext().system(), "DatabaseAnalysisTaskProcessor");

    @Autowired
    private AnalysisService service;

    @Autowired
    private DatabaseAnalysisTaskDAO taskDAO;

    @Autowired
    private SimpMessagingTemplate template;

    public void onReceive(Object message) throws Exception {
        log.debug("Received database analysis analysis task");
        DatabaseAnalysisTask task = (DatabaseAnalysisTask) message;
        DatabaseConnection conn = task.getConnection();
        String dbName = conn.getDbName();
        List<String> tables = task.getTables();
        List<DatasetMetrics> datasetMetricsList = service.analyze(dbName, conn, tables);
        if (log.isDebugEnabled()) {
            log.debug("datasetMetricsList.size " + datasetMetricsList.size());
        }

        List<TableDatasetInfo> datasets = taskDAO.create(task.getDataSource(), datasetMetricsList);

        Analysis<TableDatasetInfo> analysis = new Analysis<>();
        analysis.setSourceName(conn.getName());
        analysis.setAnalysisStatus(AnalysisStatus.READY.toString());
        analysis.setDatasets(datasets);

        this.template.convertAndSend("/topic/analysis", analysis);
    }
}
