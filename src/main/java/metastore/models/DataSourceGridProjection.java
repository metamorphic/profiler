package metastore.models;

import org.springframework.data.rest.core.config.Projection;

/**
 * Created by markmo on 7/09/2015.
 */
@Projection(name = "grid", types = DataSource.class)
public interface DataSourceGridProjection {

    Long getId();

    String getName();

    String getDescription();

    AnalysisStatus getAnalysisStatus();
}
