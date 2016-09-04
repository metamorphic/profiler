package io.metamorphic.fileservices.models;

import io.metamorphic.analysiscommons.models.DatasetInfo;

import java.util.List;

/**
 * Created by markmo on 11/10/2015.
 */
public class Analysis<T extends DatasetInfo> {

    private String sourceName;
    private String analysisStatus;
    private List<T> datasets;

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getAnalysisStatus() {
        return analysisStatus;
    }

    public void setAnalysisStatus(String analysisStatus) {
        this.analysisStatus = analysisStatus;
    }

    public List<T> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<T> datasets) {
        this.datasets = datasets;
    }
}
