package io.metamorphic.fileservices.repositories;

import metastore.models.TableDataset;
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
@RepositoryRestResource(collectionResourceRel = "table-datasets", path = "table-datasets")
public interface TableDatasetRepository extends PagingAndSortingRepository<TableDataset, Long> {

    List<TableDataset> findByName(String name);

    List<TableDataset> findByNameIgnoreCase(String name);

    List<TableDataset> findByDataSourceId(Long dataSourceId);

    @RestResource(path = "filter", rel = "filter")
    Page<TableDataset> findByNameContainingIgnoreCase(@Param("q") String name, Pageable pageable);
}
