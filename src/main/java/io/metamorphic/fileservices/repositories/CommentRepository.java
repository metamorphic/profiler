package io.metamorphic.fileservices.repositories;

import metastore.models.Comment;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * Created by markmo on 8/08/2015.
 */
@RepositoryRestResource(collectionResourceRel = "comments", path = "comments")
public interface CommentRepository extends PagingAndSortingRepository<Comment, Integer> {

    @RestResource(path = "by-column", rel = "by-column")
    List<Comment> findByColumnId(@Param("columnId") Long columnId, Sort sort);
}
