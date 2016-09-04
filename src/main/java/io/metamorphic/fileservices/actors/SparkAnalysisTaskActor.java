package io.metamorphic.fileservices.actors;

import akka.actor.UntypedActor;
import akka.event.Logging;
import akka.event.LoggingAdapter;
import io.metamorphic.analysiscommons.models.ColumnMetrics;
import io.metamorphic.analysiscommons.models.DatasetMetrics;
import io.metamorphic.fileservices.FileDatasetInfo;
import io.metamorphic.fileservices.models.Analysis;
import io.metamorphic.sparkprofiler.SparkAnalysisService;
import metastore.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

import static io.metamorphic.fileservices.helpers.AnalysisHelper.FILE_TYPE;

/**
 * Created by markmo on 6/10/2015.
 */
@Component
@Scope("prototype")
public class SparkAnalysisTaskActor extends UntypedActor {

    private final LoggingAdapter log = Logging.getLogger(getContext().system(), "SparkAnalysisTaskProcessor");

    @Autowired
    private SparkAnalysisService service;

    @Autowired
    private SimpMessagingTemplate template;

    public void onReceive(Object message) throws Exception {
        log.debug("Received Spark analysis task");
        String filename = "test";
        DatasetMetrics datasetMetrics = service.analyze("Test", "local[4]", "/Users/markmo/src/Tutorials/SparkR/Demo_SparkR/Customer_Demographics.parquet");

//        AnalysisType analysisType = analysisTypeRepository.findOne(1);
//        Iterable<DataType> dataTypes = dataTypeRepository.findAll();
//        DataType defaultDataType = selectByProperty(dataTypes, "name", "NVARCHAR");

        FileDataSource dataSource = new FileDataSource();
        dataSource.setName(filename);
//        fileDataSourceRepository.save(dataSource);

        FileDataset dataset = new FileDataset();
        dataset.setName(filename);
        dataset.setFileType(metastore.models.FileType.DELIMITED);
        dataset.setDataSource(dataSource);
//        dataset.setColumnDelimiter(fileParameters.getColumnDelimiter());
//        dataset.setHeaderRow(hasHeader);
//        dataset.setRowDelimiter(fileParameters.getLineTerminator());
//        dataset.setTextQualifier(fileParameters.getTextQualifier());
//        fileDatasetRepository.save(dataset);

        for (ColumnMetrics columnMetrics : datasetMetrics.getColumnMetricsMap().values()) {
            FileColumn fileColumn = new FileColumn();
            fileColumn.setName(columnMetrics.getName());
//            DataType dataType = selectByProperty(dataTypes, "name", columnMetrics.getDataType(), defaultDataType);
//            fileColumn.setDataType(dataType);
            fileColumn.setDataset(dataset);
//            fileColumnRepository.save(fileColumn);

//            persistColumnMetrics(metricRepository, metricValueRepository, fileColumn, analysisType, columnMetrics);
        }

        FileDatasetInfo datasetInfo = new FileDatasetInfo();
        datasetInfo.setDatasetType(FILE_TYPE);
        datasetInfo.setName(filename);
        datasetInfo.setFilename(filename);
        datasetInfo.setFileType(FileType.DELIMITED.toString());
        datasetInfo.setColumnMetricsMap(datasetMetrics.getColumnMetricsMap());
        datasetInfo.setRenderedResultMap(datasetMetrics.getRenderedResultMap());
//        datasetInfo.setFileParameters(fileParameters);

        ArrayList<FileDatasetInfo> datasets = new ArrayList<>();
        datasets.add(datasetInfo);

        Analysis<FileDatasetInfo> analysis = new Analysis<>();
        analysis.setSourceName("test");
        analysis.setAnalysisStatus(AnalysisStatus.READY.toString());
        analysis.setDatasets(datasets);

        this.template.convertAndSend("/topic/analysis", analysis);
    }
}
