package io.metamorphic.fileservices.repositories;

import metastore.models.MetricValue;
import metastore.models.MetricValuePK;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by markmo on 8/08/2015.
 */
public interface MetricValueRepository extends CrudRepository<MetricValue, MetricValuePK> {

    List<MetricValue> findByPkColumnId(Long columnId);

    List<MetricValue> findByPkAnalysisTypeId(Integer analysisTypeId);

    List<MetricValue> findByPkAnalysisTypeIdAndPkMetricIdAndPkColumnId(Integer analysisTypeId, Integer metricId, Long columnId);
}
