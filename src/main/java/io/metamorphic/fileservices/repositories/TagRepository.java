package io.metamorphic.fileservices.repositories;

import metastore.models.Tag;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * Created by markmo on 18/09/2015.
 */
@RepositoryRestResource(collectionResourceRel = "tags", path = "tags")
public interface TagRepository extends PagingAndSortingRepository<Tag, Integer> {

    List<Tag> findByNameIgnoreCase(String name);

    @RestResource(path = "containing", rel = "containing")
    List<Tag> findByNameContaining(@Param("text") String text, Sort sort);
}
