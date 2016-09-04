package io.metamorphic.fileservices.helpers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.metamorphic.analysiscommons.models.ColumnMetrics;
import io.metamorphic.analysiscommons.models.Metric;
import io.metamorphic.fileservices.repositories.MetricRepository;
import io.metamorphic.fileservices.repositories.MetricValueRepository;
import metastore.models.AnalysisType;
import metastore.models.DataColumn;
import metastore.models.MetricValue;
import metastore.models.MetricValuePK;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Component;

import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by markmo on 7/10/2015.
 */
@Component
public class AnalysisHelper {

    private static final Log log = LogFactory.getLog(AnalysisHelper.class);

    public static final String FILE_TYPE = "FILE";

    public static final String TABLE_TYPE = "TABLE";

    public static <T> List<T> filterByProperty(Iterable<T> iterable, String property, String value) {
        List<T> filtered = new ArrayList<>();
        try {
            for (T it : iterable) {
                if (value.equals(BeanUtils.getProperty(it, property))) {
                    filtered.add(it);
                }
            }
        } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            log.error(e.getMessage(), e);
            e.printStackTrace();
        }
        return filtered;
    }

    public static <T> T selectByProperty(Iterable<T> iterable, String property, String value) {
        return selectByProperty(iterable, property, value, null);
    }

    public static <T> T selectByProperty(Iterable<T> iterable, String property, String value, T defaultValue) {
        try {
            for (T it : iterable) {
                if (value.equals(BeanUtils.getProperty(it, property))) {
                    return it;
                }
            }
        } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            log.error(e.getMessage(), e);
            e.printStackTrace();
        }
        return defaultValue;
    }

    public static void persistColumnMetrics(MetricRepository metricRepository,
                                            MetricValueRepository metricValueRepository,
                                            DataColumn column,
                                            AnalysisType analysisType,
                                            ColumnMetrics columnMetrics) {
        for (Metric measure : columnMetrics.getMetricsMap().values()) {
            List<metastore.models.Metric> metrics = metricRepository.findByNameIgnoreCase(measure.getName());
            metastore.models.Metric metric;
            if (metrics.isEmpty()) {
                metric = new metastore.models.Metric();
                metric.setName(measure.getName());
                metricRepository.save(metric);
            } else {
                metric = metrics.get(0);
            }

            MetricValuePK pk = new MetricValuePK();
            pk.setAnalysisType(analysisType);
            pk.setMetric(metric);
            pk.setColumn(column);
            MetricValue metricValue = new MetricValue();
            metricValue.setPk(pk);

            Object value = measure.getValue();
            if (value != null) {
                if ("NUMERIC".equals(measure.getValueType()) ||
                        "INTEGER".equals(measure.getValueType())) {
                    try {
                        metricValue.setNumericValue(new BigDecimal(value.toString()));
                    } catch (NumberFormatException e) {
                        log.warn(e.getMessage());
                        metricValue.setStringValue(value.toString());
                    }
                } else {
                    ObjectMapper mapper = new ObjectMapper();
                    try {
                        metricValue.setStringValue(mapper.writeValueAsString(value));
                    } catch (JsonProcessingException e) {
                        log.warn(e.getMessage());
                    }
                }
            }
            metricValueRepository.save(metricValue);
        }
    }
}
