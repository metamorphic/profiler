package io.metamorphic.fileservices.controllers;

import io.metamorphic.analysisservices.analyzers.DistinctValuesAnalyzer;
import io.metamorphic.fileservices.models.ColumnListItem;
import io.metamorphic.fileservices.models.TreemapNode;
import io.metamorphic.fileservices.repositories.*;
import metastore.models.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eobjects.analyzer.beans.StringAnalyzer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.PagedResources;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by markmo on 5/10/2015.
 */
@Controller
public class CatalogController {

    private static final Log log = LogFactory.getLog(CatalogController.class);

    private static final String NA_VALUE = "N/A";

    @Autowired
    private AnalysisTypeRepository analysisTypeRepository;

    @Autowired
    private DataColumnRepository dataColumnRepository;

    @Autowired
    private FileDataSourceRepository fileDataSourceRepository;

    @Autowired
    private FileDatasetRepository fileDatasetRepository;

    @Autowired
    private MetricRepository metricRepository;

    @Autowired
    private MetricValueRepository metricValueRepository;

    @Autowired
    private TableDataSourceRepository tableDataSourceRepository;

    @Autowired
    private TableDatasetRepository tableDatasetRepository;

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "api/column-list", method = RequestMethod.GET)
    @ResponseBody
    private HttpEntity<PagedResources<ColumnListItem>> columns(Pageable pageable,
                                                               PagedResourcesAssembler assembler,
                                                               @RequestParam(value = "tag", defaultValue = "") String tagParam,
                                                               @RequestParam(value = "source", defaultValue = "") String sourceParam) {
        if (log.isDebugEnabled()) {
            log.debug("Fetching column list");
        }
        List<ColumnListItem> items = new ArrayList<>();
        Map<Long, Map<String, MetricValue>> metricValuesMap = getMetricValuesMap();
        Page<DataColumn> columns;
        if (!tagParam.isEmpty() && !sourceParam.isEmpty()) {
            columns = dataColumnRepository.findByTagIdsAndDataSourceIds(parseTagIds(tagParam), parseSourceIds(sourceParam), pageable);
        } else if (!tagParam.isEmpty()) {
            columns = dataColumnRepository.findByTagIds(parseTagIds(tagParam), pageable);
        } else if (!sourceParam.isEmpty()) {
            columns = dataColumnRepository.findByDataSourceIds(parseSourceIds(sourceParam), pageable);
        } else {
            columns = dataColumnRepository.findAll(pageable);
        }
        for (DataColumn column : columns) {
            ColumnListItem item = new ColumnListItem();
            item.setId(column.getId());
            item.setName(column.getName());
            item.setRegistered(column.getCreated());
            item.setTags(column.getTagNames());
            Dataset dataset = column.getDataset();
            if (dataset != null) {
                item.setDatasetType(dataset.getType());
                item.setDatasetName(dataset.getName());
                DataSource dataSource = dataset.getDataSource();
                if (dataSource != null) {
                    item.setDataSourceName(dataSource.getName());
                }
            }
            Long columnId = column.getId();
            if (metricValuesMap.containsKey(columnId)) {
                BigDecimal zero = new BigDecimal(0);
                Map<String, MetricValue> metricValueMap = metricValuesMap.get(columnId);
                BigDecimal distinctCount = getMetricNumericValue(metricValueMap.get(DistinctValuesAnalyzer.MEASURE_DISTINCT_VALUES_COUNT), zero);
                BigDecimal nullCount = getMetricNumericValue(metricValueMap.get(StringAnalyzer.MEASURE_NULL_COUNT), zero);
                BigDecimal rowCount = getMetricNumericValue(metricValueMap.get(StringAnalyzer.MEASURE_ROW_COUNT), zero);
                Object uniqueness;
                Object completeness;
                if (rowCount.intValue() == 0) {
                    uniqueness = NA_VALUE;
                    completeness = NA_VALUE;
                } else {
                    uniqueness = distinctCount.divide(rowCount, 2, RoundingMode.HALF_UP);
                    completeness = nullCount.divide(rowCount, 2, RoundingMode.HALF_UP);
                }
                item.setUniqueness(uniqueness);
                item.setCompleteness(completeness);
                item.setCardinality(distinctCount.intValue());
                item.setRecords(rowCount.intValue());
            }
            items.add(item);
        }
        Page<ColumnListItem> page = new PageImpl<>(items, pageable, columns.getTotalElements());
        return new ResponseEntity<PagedResources<ColumnListItem>>(assembler.toResource(page), HttpStatus.OK);
    }

    private List<ColumnListItem> columns3() {
        List<ColumnListItem> items = new ArrayList<>();
        Map<Long, Map<String, MetricValue>> metricValuesMap = getMetricValuesMap();
        for (DataColumn column : dataColumnRepository.findAll()) {
            ColumnListItem item = new ColumnListItem();
            item.setId(column.getId());
            item.setName(column.getName());
            item.setRegistered(column.getCreated());
            item.setTags(column.getTagNames());
            Dataset dataset = column.getDataset();
            if (dataset != null) {
                item.setDatasetType(dataset.getType());
                item.setDatasetName(dataset.getName());
                DataSource dataSource = dataset.getDataSource();
                if (dataSource != null) {
                    item.setDataSourceName(dataSource.getName());
                }
            }
            Long columnId = column.getId();
            if (metricValuesMap.containsKey(columnId)) {
                Map<String, MetricValue> metricValueMap = metricValuesMap.get(columnId);
                MetricValue uniquenessValue = metricValueMap.get("Uniqueness");
                MetricValue completenessValue = metricValueMap.get("Completeness");
                MetricValue cardinalityValue = metricValueMap.get(DistinctValuesAnalyzer.MEASURE_DISTINCT_VALUES_COUNT);
                MetricValue recordsValue = metricValueMap.get(StringAnalyzer.MEASURE_ROW_COUNT);
                if (uniquenessValue != null) {
                    item.setUniqueness(uniquenessValue.getNumericValue());
                }
                if (completenessValue != null) {
                    item.setCompleteness(completenessValue.getNumericValue());
                }
                if (cardinalityValue != null) {
                    BigDecimal cardinality = cardinalityValue.getNumericValue();
                    if (cardinality != null) {
                        item.setCardinality(cardinality.intValue());
                    }
                }
                if (recordsValue != null) {
                    BigDecimal records = recordsValue.getNumericValue();
                    if (records != null) {
                        item.setRecords(records.intValue());
                    }
                }
            }
            items.add(item);
        }
        return items;
    }

    // too many queries -- too slow!
    private List<ColumnListItem> columns2() {
        List<ColumnListItem> items = new ArrayList<>();
        AnalysisType analysisType = analysisTypeRepository.findOne(1);
        for (DataColumn column : dataColumnRepository.findAll()) {
            ColumnListItem item = new ColumnListItem();
            item.setId(column.getId());
            item.setName(column.getName());
            item.setRegistered(column.getCreated());
            item.setTags(column.getTagNames());
            Dataset dataset = column.getDataset();
            if (dataset != null) {
                item.setDatasetType(dataset.getType());
                item.setDatasetName(dataset.getName());
                DataSource dataSource = dataset.getDataSource();
                if (dataSource != null) {
                    item.setDataSourceName(dataSource.getName());
                }
            }
            BigDecimal zero = new BigDecimal(0);
            BigDecimal distinctCount = (BigDecimal)getMetricValue(analysisType, column, DistinctValuesAnalyzer.MEASURE_DISTINCT_VALUES_COUNT, zero);
            BigDecimal nullCount = (BigDecimal)getMetricValue(analysisType, column, StringAnalyzer.MEASURE_NULL_COUNT, zero);
            BigDecimal rowCount = (BigDecimal)getMetricValue(analysisType, column, StringAnalyzer.MEASURE_ROW_COUNT, zero);
            Object uniqueness;
            Object completeness;
            if (rowCount.intValue() == 0) {
                uniqueness = NA_VALUE;
                completeness = NA_VALUE;
            } else {
                uniqueness = distinctCount.divide(rowCount, 2, RoundingMode.HALF_UP);
                completeness = nullCount.divide(rowCount, 2, RoundingMode.HALF_UP);
            }
            item.setUniqueness(uniqueness);
            item.setCompleteness(completeness);
            item.setCardinality(distinctCount.intValue());
            item.setRecords(rowCount.intValue());
            items.add(item);
        }
        return items;
    }

    @RequestMapping(value = "/api/treemap", method = RequestMethod.GET)
    @ResponseBody
    public List<TreemapNode> fetchTreemap() {
        if (log.isDebugEnabled()) {
            log.debug("Fetching Treemap");
        }
        List<TreemapNode> treemap = new ArrayList<>();
        AnalysisType analysisType = analysisTypeRepository.findOne(1);
        if (log.isDebugEnabled()) {
            log.debug("Found analysis type " + analysisType.getName());
        }
        List<metastore.models.Metric> metrics = metricRepository.findByNameIgnoreCase(StringAnalyzer.MEASURE_ROW_COUNT);
        if (metrics.isEmpty()) return treemap;
        metastore.models.Metric rowCountMetric = metrics.get(0);
        if (log.isDebugEnabled()) {
            log.debug("Found metric " + rowCountMetric.getName());
        }
        for (TableDataSource tableDataSource : tableDataSourceRepository.findAll()) {
            if (log.isDebugEnabled()) {
                log.debug("Processing data source " + tableDataSource.getName());
            }
            TreemapNode dataSourceGroup = new TreemapNode(tableDataSource.getId(), tableDataSource.getName());
            Integer dataSourceGroupWeight = 0;
            for (TableDataset tableDataset : tableDatasetRepository.findByDataSourceId(tableDataSource.getId())) {
                if (log.isDebugEnabled()) {
                    log.debug("Processing dataset " + tableDataset.getName());
                }
                TreemapNode datasetGroup = new TreemapNode(tableDataset.getId(), tableDataset.getName());
                if (tableDataset.getColumns() != null && !tableDataset.getColumns().isEmpty()) {
                    TableColumn column = tableDataset.getColumns().get(0);
                    if (log.isDebugEnabled()) {
                        log.debug("Found first column " + column.getName());
                    }
                    // seems to be a Hibernate bug
                    // WrongClassException: Object was not of the specified subclass
                    // is expecting a FileDataset when (correct) associated object is
                    // a TableDataset
//                    MetricValuePK pk = new MetricValuePK();
//                    pk.setAnalysisType(analysisType);
//                    pk.setMetric(rowCountMetric);
//                    pk.setColumn(column);
//                    MetricValue metricValue = metricValueRepository.findOne(pk);
                    List<MetricValue> metricValues = metricValueRepository
                            .findByPkAnalysisTypeIdAndPkMetricIdAndPkColumnId(
                                    analysisType.getId(),
                                    rowCountMetric.getId(),
                                    column.getId()
                            );
                    if (!metricValues.isEmpty()) {
                        MetricValue metricValue = metricValues.get(0);
                        if (log.isDebugEnabled()) {
                            log.debug("Found metric value " + metricValue);
                        }
                        BigDecimal value = metricValue.getNumericValue();
                        if (value != null) {
                            if (log.isDebugEnabled()) {
                                log.debug("Found row count value " + value);
                            }
                            Integer rowCount = value.intValue();
                            if (rowCount > 0) {
                                dataSourceGroupWeight += rowCount;
                                datasetGroup.setWeight(rowCount);
                                dataSourceGroup.addGroup(datasetGroup);
                            }
                        }
                    }
                }

            }
            if (dataSourceGroupWeight > 0) {
                dataSourceGroup.setWeight(dataSourceGroupWeight);
                treemap.add(dataSourceGroup);
            }
        }
        for (FileDataSource fileDataSource : fileDataSourceRepository.findAll()) {
            TreemapNode dataSourceGroup = new TreemapNode(fileDataSource.getId(), fileDataSource.getName());
            Integer dataSourceGroupWeight = 0;
            for (FileDataset fileDataset : fileDatasetRepository.findByDataSourceId(fileDataSource.getId())) {
                TreemapNode datasetGroup = new TreemapNode(fileDataset.getId(), fileDataset.getName());
                if (fileDataset.getColumns() != null && !fileDataset.getColumns().isEmpty()) {
                    FileColumn column = fileDataset.getColumns().get(0);
                    MetricValuePK pk = new MetricValuePK();
                    pk.setAnalysisType(analysisType);
                    pk.setMetric(rowCountMetric);
                    pk.setColumn(column);
                    MetricValue metricValue = metricValueRepository.findOne(pk);
                    if (metricValue != null) {
                        BigDecimal value = metricValue.getNumericValue();
                        if (value != null) {
                            Integer rowCount = value.intValue();
                            if (rowCount > 0) {
                                dataSourceGroupWeight += rowCount;
                                datasetGroup.setWeight(rowCount);
                                dataSourceGroup.addGroup(datasetGroup);
                            }
                        }
                    }
                }
            }
            if (dataSourceGroupWeight > 0) {
                dataSourceGroup.setWeight(dataSourceGroupWeight);
                treemap.add(dataSourceGroup);
            }
        }
        return treemap;
    }

    private Map<Long, Map<String, MetricValue>> getMetricValuesMap() {
        Map<Long, Map<String, MetricValue>> metricValuesMap = new HashMap<>();
        for (MetricValue metricValue : metricValueRepository.findByPkAnalysisTypeId(1)) {
            Long columnId = metricValue.getPk().getColumn().getId();
            if (!metricValuesMap.containsKey(columnId)) {
                metricValuesMap.put(columnId, new HashMap<String, MetricValue>());
            }
            String measure = metricValue.getPk().getMetric().getName();
            metricValuesMap.get(columnId).put(measure, metricValue);
        }
        return metricValuesMap;
    }

    private Object getMetricValue(MetricValue metricValue) {
        if (metricValue == null) return null;
        BigDecimal numericValue = metricValue.getNumericValue();
        if (numericValue == null) {
            return metricValue.getStringValue();
        }
        return numericValue;
    }

    private Object getMetricValue(AnalysisType analysisType, DataColumn column, String measure, Object defaultValue) {
        List<metastore.models.Metric> metrics = metricRepository.findByNameIgnoreCase(measure);
        if (metrics.isEmpty()) return defaultValue;
        metastore.models.Metric metric = metrics.get(0);
        List<MetricValue> metricValues = metricValueRepository
                .findByPkAnalysisTypeIdAndPkMetricIdAndPkColumnId(
                        analysisType.getId(),
                        metric.getId(),
                        column.getId()
                );
        if (metricValues.isEmpty()) return defaultValue;
        MetricValue metricValue = metricValues.get(0);
        BigDecimal numericValue = metricValue.getNumericValue();
        if (numericValue == null) {
            return metricValue.getStringValue();
        }
        return numericValue;
    }

    private BigDecimal getMetricNumericValue(MetricValue metricValue, BigDecimal defaultValue) {
        if (metricValue == null) return defaultValue;
        BigDecimal numericValue = metricValue.getNumericValue();
        if (numericValue == null) {
            return defaultValue;
        }
        return numericValue;
    }

    private List<Integer> parseTagIds(String csv) {
        List<Integer> ids = new ArrayList<>();
        for (String id : csv.split(",")) {
            ids.add(Integer.parseInt(id, 10));
        }
        return ids;
    }

    private List<Long> parseSourceIds(String csv) {
        List<Long> ids = new ArrayList<>();
        for (String id : csv.split(",")) {
            ids.add(Long.parseLong(id, 10));
        }
        return ids;
    }
}
