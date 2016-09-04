package io.metamorphic.fileservices.repositories;

import metastore.models.DataSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

/**
 * Created by markmo on 8/08/2015.
 */
@RepositoryRestResource(collectionResourceRel = "data-sources", path = "data-sources")
public interface DataSourceRepository extends PagingAndSortingRepository<DataSource, Long> {

    @RestResource(path = "filter", rel = "filter")
    Page<DataSource> findByNameContainingIgnoreCase(@Param("q") String name, Pageable pageable);
}
