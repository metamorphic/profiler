package io.metamorphic.fileservices.models;

import java.util.Date;

/**
 * Created by markmo on 12/09/2015.
 */
public class ColumnListItem {

    private Long id;
    private String name;
    private String datasetType;
    private String dataSourceName;
    private String datasetName;
    private Date registered;
    private String tags;
    private Object uniqueness;
    private Object completeness;
    private int cardinality;
    private int records;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDatasetType() {
        return datasetType;
    }

    public void setDatasetType(String datasetType) {
        this.datasetType = datasetType;
    }

    public String getDataSourceName() {
        return dataSourceName;
    }

    public void setDataSourceName(String dataSourceName) {
        this.dataSourceName = dataSourceName;
    }

    public String getDatasetName() {
        return datasetName;
    }

    public void setDatasetName(String datasetName) {
        this.datasetName = datasetName;
    }

    public Date getRegistered() {
        return registered;
    }

    public void setRegistered(Date registered) {
        this.registered = registered;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Object getUniqueness() {
        return uniqueness;
    }

    public void setUniqueness(Object uniqueness) {
        this.uniqueness = uniqueness;
    }

    public Object getCompleteness() {
        return completeness;
    }

    public void setCompleteness(Object completeness) {
        this.completeness = completeness;
    }

    public int getCardinality() {
        return cardinality;
    }

    public void setCardinality(int cardinality) {
        this.cardinality = cardinality;
    }

    public int getRecords() {
        return records;
    }

    public void setRecords(int records) {
        this.records = records;
    }
}
