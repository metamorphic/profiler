package io.metamorphic.fileservices.repositories;

import metastore.models.FileColumn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@RepositoryRestResource(collectionResourceRel = "file-columns", path = "file-columns")
public interface FileColumnRepository extends PagingAndSortingRepository<FileColumn, Long> {

    @RestResource(path = "filter", rel = "filter")
    Page<FileColumn> findByNameContainingIgnoreCase(@Param("q") String name, Pageable pageable);

    @Query("select c from FileColumn c join c.eventPropertyTypes e where e.id = :id")
    List<FileColumn> findByEventPropertyTypeId(@Param("id") Long id);

    @RestResource(path = "by-dataset-and-filter", rel = "by-dataset-and-filter")
    Page<FileColumn> findByDatasetIdAndNameContainingIgnoreCase(@Param("datasetId") Long datasetId, @Param("q") String name, Pageable pageable);

    @RestResource(path = "by-dataset", rel = "by-dataset")
    Page<FileColumn> findByDatasetId(@Param("datasetId") Long datasetId, Pageable pageable);
}