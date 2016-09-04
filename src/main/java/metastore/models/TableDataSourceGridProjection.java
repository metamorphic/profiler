package metastore.models;

import org.springframework.data.rest.core.config.Projection;

/**
 * Created by markmo on 4/10/2015.
 */
@Projection(name = "grid", types = TableDataSource.class)
public interface TableDataSourceGridProjection {

    Long getId();

    String getName();

    String getSourcingMethod();

    String getHostname();

    String getIpaddr();

    int getPort();

    String getFirewallStatus();

    String getDescription();

    DatabaseServerType getServerType();

    String getServerVersion();

    String getDatabaseName();

    String getConnectionUrl();

    String getCatalogName();

    String getSchemaName();

    String getTableName();

    String getUsername();

    String getPassword();

    AnalysisStatus getAnalysisStatus();
}
