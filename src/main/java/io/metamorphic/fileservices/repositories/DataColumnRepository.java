package io.metamorphic.fileservices.repositories;

import metastore.models.DataColumn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

/**
 * Created by markmo on 12/09/2015.
 */
public interface DataColumnRepository extends PagingAndSortingRepository<DataColumn, Long> {

    @Query("select c from DataColumn c where c.dataset.dataSource.id in ?1")
    Page<DataColumn> findByDataSourceIds(List<Long> sourceIds, Pageable pageable);

    @Query("select distinct c from DataColumn c join c.tags t where t.id in ?1")
    Page<DataColumn> findByTagIds(List<Integer> tagIds, Pageable pageable);

    @Query("select distinct c from DataColumn c left join c.tags t where t.id in ?1 or c.dataset.dataSource.id in ?2")
    Page<DataColumn> findByTagIdsAndDataSourceIds(List<Integer> tagIds, List<Long> dataSourceIds, Pageable pageable);
}
