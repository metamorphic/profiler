package io.metamorphic.fileservices.repositories;

import io.metamorphic.analysiscommons.models.ColumnMetrics;
import io.metamorphic.analysiscommons.models.DatasetMetrics;
import io.metamorphic.fileservices.models.TableDatasetInfo;
import metastore.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

import static io.metamorphic.fileservices.helpers.AnalysisHelper.*;

/**
 * Created by markmo on 7/10/2015.
 */
@Repository
public class DatabaseAnalysisTaskDAO {

    @Autowired
    private AnalysisTypeRepository analysisTypeRepository;

    @Autowired
    private DataTypeRepository dataTypeRepository;

    @Autowired
    private TableDatasetRepository tableDatasetRepository;

    @Autowired
    private TableColumnRepository tableColumnRepository;

    @Autowired
    protected MetricRepository metricRepository;

    @Autowired
    protected MetricValueRepository metricValueRepository;

    public List<TableDatasetInfo> create(final TableDataSource tableDataSource,
                                         final List<DatasetMetrics> datasetMetricsList) {
        AnalysisType analysisType = analysisTypeRepository.findOne(1);
        Iterable<DataType> dataTypes = dataTypeRepository.findAll();
        DataType defaultDataType = selectByProperty(dataTypes, "name", "NVARCHAR");

        List<TableDatasetInfo> datasets = new ArrayList<>();
        for (DatasetMetrics datasetMetrics : datasetMetricsList) {
            String table = datasetMetrics.getName();
            TableDataset dataset = new TableDataset();
            dataset.setName(table);
            dataset.setDataSource(tableDataSource);
            tableDatasetRepository.save(dataset);

            TableDatasetInfo datasetInfo = new TableDatasetInfo();
            datasetInfo.setDatasetType(TABLE_TYPE);
            datasetInfo.setName(table);
            datasetInfo.setColumnMetricsMap(datasetMetrics.getColumnMetricsMap());
            datasetInfo.setRenderedResultMap(datasetMetrics.getRenderedResultMap());
            for (ColumnMetrics columnMetrics : datasetMetrics.getColumnMetricsMap().values()) {
                TableColumn tableColumn = new TableColumn();
                tableColumn.setColumnIndex(columnMetrics.getColumnIndex());
                tableColumn.setName(columnMetrics.getName());
                DataType dataType = selectByProperty(dataTypes, "name", columnMetrics.getDataType(), defaultDataType);
                tableColumn.setDataType(dataType);
                tableColumn.setDataset(dataset);
                tableColumnRepository.save(tableColumn);

                persistColumnMetrics(metricRepository, metricValueRepository, tableColumn, analysisType, columnMetrics);
            }
            datasets.add(datasetInfo);
        }

        return datasets;
    }
}
