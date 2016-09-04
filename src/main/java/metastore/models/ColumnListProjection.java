package metastore.models;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.Date;

/**
 * Created by markmo on 12/09/2015.
 */
@Projection(name = "list", types = DataColumn.class)
public interface ColumnListProjection {

    String getName();

    @Value("#{dataset?.type}")
    String getDatasetType();

    @Value("#{dataset?.dataSource?.name}")
    String getDataSourceName();

    @Value("#{dataset?.name}")
    String getDatasetName();

    @Value("#{created}")
    Date getRegistered();

    String getTagNames();
}
