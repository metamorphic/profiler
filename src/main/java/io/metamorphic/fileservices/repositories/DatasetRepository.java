package io.metamorphic.fileservices.repositories;

import metastore.models.Dataset;
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
@RepositoryRestResource(collectionResourceRel = "datasets", path = "datasets")
public interface DatasetRepository extends PagingAndSortingRepository<Dataset, Long> {

    List<Dataset> findByName(String name);

    List<Dataset> findByNameIgnoreCase(String name);

    @RestResource(path = "filter", rel = "filter")
    Page<Dataset> findByNameContainingIgnoreCase(@Param("q") String name, Pageable pageable);
}
