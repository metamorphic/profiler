package io.metamorphic.fileservices.controllers;

import au.com.bytecode.opencsv.CSVParser;
import au.com.bytecode.opencsv.CSVReader;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.metamorphic.analysiscommons.models.ColumnMetrics;
import io.metamorphic.analysiscommons.models.DatasetInfo;
import io.metamorphic.analysiscommons.models.DatasetMetrics;
import io.metamorphic.analysisservices.AnalysisService;
import io.metamorphic.fileservices.*;
import io.metamorphic.fileservices.models.TableDatasetInfo;
import io.metamorphic.fileservices.repositories.*;
import metastore.models.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.StringReader;
import java.util.*;

import static io.metamorphic.fileservices.helpers.AnalysisHelper.*;

/**
 * Created by markmo on 6/07/2015.
 */
@Controller
public class FileAnalysisController {

    private static final Log log = LogFactory.getLog(FileAnalysisController.class);

    private static final int MAX_SAMPLE_SIZE = 999999;

    @Autowired
    private FileService fs;

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private DataSourceRepository dataSourceRepository;

    @Autowired
    private TableDatasetRepository tableDatasetRepository;

    @Autowired
    private FileDataSourceRepository fileDataSourceRepository;

    @Autowired
    private FileDatasetRepository fileDatasetRepository;

    @Autowired
    private FileColumnRepository fileColumnRepository;

    @Autowired
    private AnalysisTypeRepository analysisTypeRepository;

    @Autowired
    private DataTypeRepository dataTypeRepository;

    @Autowired
    protected MetricRepository metricRepository;

    @Autowired
    protected MetricValueRepository metricValueRepository;

    @RequestMapping(value = "/api/data-sources/{dataSourceId}/analysis", method = RequestMethod.GET)
    @ResponseBody
    public List<? extends DatasetInfo> fetchAnalysis(@PathVariable("dataSourceId") Long dataSourceId) {
        if (log.isDebugEnabled()) {
            log.debug("Fetch analysis on data source with id:" + dataSourceId);
        }
        DataSource dataSource = dataSourceRepository.findOne(dataSourceId);
        if (log.isDebugEnabled()) {
            log.debug("Found " + dataSource.getName());
        }
        if (dataSource instanceof TableDataSource) {
            if (log.isDebugEnabled()) {
                log.debug("Source is a table");
            }
            return fetchTableAnalysis(dataSourceId);
        }
        if (log.isDebugEnabled()) {
            log.debug("Source is a file");
        }
        return fetchFileAnalysis(dataSourceId);
    }

    @RequestMapping(value = "/api/table-data-sources/{tableDataSourceId}/analysis", method = RequestMethod.GET)
    @ResponseBody
    public List<TableDatasetInfo> fetchTableAnalysis(@PathVariable("tableDataSourceId") Long tableDataSourceId) {
        if (log.isDebugEnabled()) {
            log.debug("fetchTableAnalysis called");
        }
        List<TableDatasetInfo> response = new ArrayList<>();
        List<TableDataset> datasets = tableDatasetRepository.findByDataSourceId(tableDataSourceId);
        if (log.isDebugEnabled()) {
            log.debug("Found " + datasets.size() + " datasets");
        }
        for (TableDataset dataset : datasets) {
            if (log.isDebugEnabled()) {
                log.debug(dataset.getName());
            }
            TableDatasetInfo datasetInfo = new TableDatasetInfo();
            datasetInfo.setDatasetType(TABLE_TYPE);
            datasetInfo.setName(dataset.getName());
            Map<String, ColumnMetrics> columnMetricsMap = getColumnMetricsMap(dataset.getColumns());
            datasetInfo.setColumnMetricsMap(columnMetricsMap);
            response.add(datasetInfo);
        }
        return response;
    }

    @RequestMapping(value = "/api/file-data-sources/{fileDataSourceId}/analysis", method = RequestMethod.GET)
    @ResponseBody
    public List<FileDatasetInfo> fetchFileAnalysis(@PathVariable("fileDataSourceId") Long fileDataSourceId) {
        if (log.isDebugEnabled()) {
            log.debug("fetchFileAnalysis called");
        }
        List<FileDatasetInfo> response = new ArrayList<>();
        FileDataSource dataSource = fileDataSourceRepository.findOne(fileDataSourceId);
        List<FileDataset> datasets = fileDatasetRepository.findByDataSourceId(fileDataSourceId);
        if (log.isDebugEnabled()) {
            log.debug("Found " + datasets.size() + " datasets");
        }
        for (FileDataset dataset : datasets) {
            if (log.isDebugEnabled()) {
                log.debug(dataset.getName());
            }
            FileDatasetInfo datasetInfo = new FileDatasetInfo();
            datasetInfo.setDatasetType(FILE_TYPE);
            datasetInfo.setName(dataset.getName());
            datasetInfo.setFilename(dataSource.getFilepath());
            Map<String, ColumnMetrics> columnMetricsMap = getColumnMetricsMap(dataset.getColumns());
            datasetInfo.setColumnMetricsMap(columnMetricsMap);
            response.add(datasetInfo);
        }
        return response;
    }

    @RequestMapping(value = "/api/sniff", method = RequestMethod.POST)
    @ResponseBody
    public DatasetInfo sniff(@RequestParam("file") MultipartFile file,
                             @RequestParam(value = "render", defaultValue = "false") boolean render) {
        if (!file.isEmpty()) {
            String filename = file.getOriginalFilename();
            String data = readFileAsString(file);

            // determine line ending
            LinesContainer lc = fs.readLines(data);
            String lineEnding = lc.lineEnding;

            FileParameters fileParameters = fs.sniff(data, lineEnding);
            if (fileParameters == null) {
                return null;
            }
            char quoteChar = getQuoteChar(fileParameters.getTextQualifier());
            CSVParser parser = new CSVParser(fileParameters.getColumnDelimiter(), quoteChar);
            RowsContainer rc;
            try (CSVReader reader = new CSVReader(new StringReader(data), 0, parser)) {
                rc = readRows(reader, MAX_SAMPLE_SIZE);
            } catch (IOException e) {
                log.error(e.getMessage(), e);
                e.printStackTrace();
                return null;
            }
            String[][] sample = rc.rows;
            int sampleSize = sample.length;
            int maxNumberColumns = rc.maxNumberColumns;
            boolean hasHeader = fs.hasHeader(sample);
            fileParameters.setHeader(hasHeader);

            if (log.isDebugEnabled()) {
                log.debug("header? " + (hasHeader ? "YES" : "NO"));
            }

            TypesContainer tc = fs.getTypes(sample, sampleSize, maxNumberColumns, hasHeader);
            TypeInfo[] types = tc.types;

            String[] header = fs.getHeader(sample, types, hasHeader);

            List<String> columnTypeNames = new ArrayList<>();
            for (TypeInfo type : types) {
                columnTypeNames.add(type.getType().toString());
                //columnTypeNames.add("NVARCHAR");
            }
            columnTypeNames = getAnalysisTypes(columnTypeNames);
            List<List<String>> sampleAsList = rowsAsList(sample);
            if (hasHeader) {
                sampleAsList = sampleAsList.subList(1, sampleSize);
            }

            if (log.isDebugEnabled()) {
                log.debug("columns:");
                log.debug(Arrays.asList(header));
                log.debug("column type names:");
                log.debug(columnTypeNames);
                log.debug("firstRow:");
                log.debug(sampleAsList.get(0));
            }

            DatasetMetrics datasetMetrics = analysisService.analyze(filename, sampleAsList, Arrays.asList(header), columnTypeNames, render);

            AnalysisType analysisType = analysisTypeRepository.findOne(1);
            Iterable<DataType> dataTypes = dataTypeRepository.findAll();
            DataType defaultDataType = selectByProperty(dataTypes, "name", "NVARCHAR");

            FileDataSource dataSource = new FileDataSource();
            dataSource.setName(filename);
            fileDataSourceRepository.save(dataSource);

            FileDataset dataset = new FileDataset();
            dataset.setName(filename);
            dataset.setFileType(metastore.models.FileType.DELIMITED);
            dataset.setDataSource(dataSource);
            dataset.setColumnDelimiter(fileParameters.getColumnDelimiter());
            dataset.setHeaderRow(hasHeader);
            dataset.setRowDelimiter(fileParameters.getLineTerminator());
            dataset.setTextQualifier(fileParameters.getTextQualifier());
            fileDatasetRepository.save(dataset);

            for (ColumnMetrics columnMetrics : datasetMetrics.getColumnMetricsMap().values()) {
                FileColumn fileColumn = new FileColumn();
                fileColumn.setName(columnMetrics.getName());
                DataType dataType = selectByProperty(dataTypes, "name", columnMetrics.getDataType(), defaultDataType);
                fileColumn.setDataType(dataType);
                fileColumn.setDataset(dataset);
                fileColumnRepository.save(fileColumn);

                persistColumnMetrics(metricRepository, metricValueRepository, fileColumn, analysisType, columnMetrics);
            }

            FileDatasetInfo datasetInfo = new FileDatasetInfo();
            datasetInfo.setDatasetType(FILE_TYPE);
            datasetInfo.setName(filename);
            datasetInfo.setFilename(filename);
            datasetInfo.setFileType(FileType.DELIMITED.toString());
            datasetInfo.setColumnMetricsMap(datasetMetrics.getColumnMetricsMap());
            datasetInfo.setRenderedResultMap(datasetMetrics.getRenderedResultMap());
            datasetInfo.setFileParameters(fileParameters);

            return datasetInfo;
        }
        return null;
    }

    private static class RowsContainer {

        String[][] rows;
        int maxNumberColumns;

        RowsContainer(String[][] rows, int maxNumberColumns) {
            this.rows = rows;
            this.maxNumberColumns = maxNumberColumns;
        }
    }

    private static String readFileAsString(MultipartFile file) {
        StringBuilder sb = new StringBuilder();
        final byte[] bytes = new byte[1024];
        try (BufferedInputStream inputStream = new BufferedInputStream(file.getInputStream())) {
            int read;
            while ((read = inputStream.read(bytes)) != -1) {
                sb.append(new String(bytes, 0, read));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return sb.toString();
    }

    private static List<List<String>> rowsAsList(String[][] data) {
        List<List<String>> rows = new ArrayList<>(data.length);
        for (String[] row : data) {
            rows.add(Arrays.asList(row));
        }
        return rows;
    }

    private static char getQuoteChar(String textQualifier) {
        return (textQualifier == null || textQualifier.trim().isEmpty()) ?
                CSVParser.DEFAULT_QUOTE_CHARACTER : textQualifier.charAt(0);
    }

    private static List<String> getAnalysisTypes(List<String> typeNames) {
        List<String> newTypes = new ArrayList<>();
        for (String name : typeNames) {
            newTypes.add(getAnalysisType(name));
        }
        return newTypes;
    }

    private static String getAnalysisType(String typeName) {
        switch (typeName) {
            case "NUMERIC":
                return "DECIMAL";
            case "STRING":
                return "NVARCHAR";
            case "TEXT":
                return "LONGNVARCHAR";
            default:
                return typeName;
        }
    }

    private Map<String, ColumnMetrics> getColumnMetricsMap(List<? extends DataColumn> columns) {
        Map<String, ColumnMetrics> columnMetricsMap = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        for (DataColumn column : columns) {
            String columnName = column.getName();
            ColumnMetrics columnMetrics = new ColumnMetrics(columnName, column.getColumnIndex(), column.getDataTypeName());
            List<MetricValue> metricValues = metricValueRepository.findByPkColumnId(column.getId());
            for (metastore.models.MetricValue metricValue : metricValues) {
                String measure = metricValue.getPk().getMetric().getName();
                String value = metricValue.toString();
                if (value != null) {
                    Object val;
                    try {
                        if (value.startsWith("[{")) {
                            val = mapper.readValue(value, new TypeReference<List<HashMap>>() {
                            });
                        } else if (value.startsWith("{")) {
                            val = mapper.readValue(value, HashMap.class);
                        } else if (value.startsWith("[")) {
                            val = mapper.readValue(value, Object[].class);
                        } else {
                            val = value;
                        }
                        columnMetrics.addMetric(measure, val);
                    } catch (IOException e) {
                        log.warn(e.getMessage());
                    }
                }
            }
            columnMetricsMap.put(columnName, columnMetrics);
        }
        return columnMetricsMap;
    }

    private RowsContainer readRows(CSVReader reader, int maxSampleSize) throws IOException {
        if (log.isDebugEnabled()) {
            log.debug("reading rows");
        }
        List<String[]> rowList = new ArrayList<>();
        int maxNumberColumns = 0;
        int k = 0;
        String[] nextLine;
        while ((nextLine = reader.readNext()) != null) {
            rowList.add(nextLine);
            maxNumberColumns = Math.max(maxNumberColumns, nextLine.length);
            k += 1;
            if (k == maxSampleSize) break;
        }
        int n = Math.min(maxSampleSize, rowList.size());
        if (log.isDebugEnabled()) {
            log.debug("rows " + n);
            log.debug("cols " + maxNumberColumns);
        }
        String[][] rows = new String[n][maxNumberColumns];
        for (int i = 0; i < n; i++) {
            String[] row = rowList.get(i);
            System.arraycopy(row, 0, rows[i], 0, row.length);
        }
        return new RowsContainer(rows, maxNumberColumns);
    }
}
