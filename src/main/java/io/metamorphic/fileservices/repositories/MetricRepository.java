package io.metamorphic.fileservices.repositories;

import metastore.models.Metric;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by markmo on 8/08/2015.
 */
public interface MetricRepository extends CrudRepository<Metric, Integer> {

    List<Metric> findByNameIgnoreCase(String name);
}
