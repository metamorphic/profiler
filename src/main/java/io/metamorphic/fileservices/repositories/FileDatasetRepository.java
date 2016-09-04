package io.metamorphic.fileservices.repositories;

import metastore.models.FileDataset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@RepositoryRestResource(collectionResourceRel = "file-datasets", path = "file-datasets")
public interface FileDatasetRepository extends PagingAndSortingRepository<FileDataset, Long> {

    List<FileDataset> findByName(String name);

    List<FileDataset> findByDataSourceId(Long dataSourceId);

    @RestResource(path = "filter", rel = "filter")
    Page<FileDataset> findByNameContainingIgnoreCase(@Param("q") String name, Pageable pageable);
}
