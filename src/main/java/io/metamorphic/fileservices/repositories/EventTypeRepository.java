package io.metamorphic.fileservices.repositories;

import metastore.models.EventType;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@RepositoryRestResource(collectionResourceRel = "event-types", path = "event-types")
public interface EventTypeRepository extends PagingAndSortingRepository<EventType, Integer> {
}
