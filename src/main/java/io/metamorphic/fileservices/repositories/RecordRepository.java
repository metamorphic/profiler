package io.metamorphic.fileservices.repositories;

import metastore.models.Record;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@RepositoryRestResource(collectionResourceRel = "records", path = "records")
public interface RecordRepository extends PagingAndSortingRepository<Record, Long> {

    @RestResource(path = "by-dataset-and-filter", rel = "by-dataset-and-filter")
    Page<Record> findByDatasetIdAndNameContainingIgnoreCase(@Param("datasetId") Long datasetId, @Param("q") String name, Pageable pageable);

    @RestResource(path = "by-dataset", rel = "by-dataset")
    Page<Record> findByDatasetId(@Param("datasetId") Long datasetId, Pageable pageable);
}
