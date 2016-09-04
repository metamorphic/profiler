package io.metamorphic.fileservices.repositories;

import metastore.models.DataType;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by markmo on 7/09/2015.
 */
public interface DataTypeRepository extends CrudRepository<DataType, Integer> {

    List<DataType> findByName(String name);
}
