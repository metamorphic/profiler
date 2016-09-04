package io.metamorphic.fileservices.repositories;

import metastore.models.SecurityClassification;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@RepositoryRestResource(collectionResourceRel = "security-classifications", path = "security-classifications")
public interface SecurityClassificationRepository extends PagingAndSortingRepository<SecurityClassification, Integer> {
}
