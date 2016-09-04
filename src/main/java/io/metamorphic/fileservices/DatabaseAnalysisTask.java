package io.metamorphic.fileservices;

import io.metamorphic.analysiscommons.models.DatabaseConnection;
import metastore.models.TableDataSource;

import java.util.List;

/**
 * Created by markmo on 6/10/2015.
 */
public class DatabaseAnalysisTask {

    private TableDataSource dataSource;
    private DatabaseConnection connection;
    private List<String> tables;
    private int priority;

    public TableDataSource getDataSource() {
        return dataSource;
    }

    public void setDataSource(TableDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public DatabaseConnection getConnection() {
        return connection;
    }

    public void setConnection(DatabaseConnection connection) {
        this.connection = connection;
    }

    public List<String> getTables() {
        return tables;
    }

    public void setTables(List<String> tables) {
        this.tables = tables;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }
}
