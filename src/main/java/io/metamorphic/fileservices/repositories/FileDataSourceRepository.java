package io.metamorphic.fileservices.repositories;

import metastore.models.FileDataSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

/**
 * Created by markmo on 8/08/2015.
 */
@RepositoryRestResource(collectionResourceRel = "file-data-sources", path = "file-data-sources")
public interface FileDataSourceRepository extends PagingAndSortingRepository<FileDataSource, Long> {

    @RestResource(path = "filter", rel = "filter")
    Page<FileDataSource> findByNameContainingIgnoreCase(@Param("q") String name, Pageable pageable);
}
