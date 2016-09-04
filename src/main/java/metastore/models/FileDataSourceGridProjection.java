package metastore.models;

import org.springframework.data.rest.core.config.Projection;

/**
 * Created by markmo on 4/10/2015.
 */
@Projection(name = "grid", types = FileDataSource.class)
public interface FileDataSourceGridProjection {

    Long getId();

    String getName();

    String getSourcingMethod();

    String getHostname();

    String getIpaddr();

    int getPort();

    String getFirewallStatus();

    String getDescription();

    String getNetwork();

    String getFilepath();

    String getFilenamePattern();

    AnalysisStatus getAnalysisStatus();
}
