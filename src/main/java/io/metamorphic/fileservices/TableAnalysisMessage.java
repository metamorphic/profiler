package io.metamorphic.fileservices;

import com.google.common.base.Joiner;

import java.util.List;

/**
 * Created by markmo on 6/10/2015.
 */
public class TableAnalysisMessage {

    private Long dataSourceId;
    private List<String> tables;

    public Long getDataSourceId() {
        return dataSourceId;
    }

    public void setDataSourceId(Long dataSourceId) {
        this.dataSourceId = dataSourceId;
    }

    public List<String> getTables() {
        return tables;
    }

    public void setTables(List<String> tables) {
        this.tables = tables;
    }

    @Override
    public String toString() {
        return "{ dataSourceId: " + dataSourceId + ", tables: [\"" +
                Joiner.on("\", \"").join(tables) + "\"] }";
    }
}
