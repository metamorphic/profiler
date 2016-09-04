package metastore.models;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@Projection(name = "grid", types = TableColumn.class)
public interface TableColumnGridProjection {

    String getName();

    @Value("#{target.dataset?.name}")
    String getDatasetName();

    @Value("#{target.dataset?.id}")
    Long getDatasetId();

    @Value("#{target.dataType?.name}")
    String getDataTypeName();

    @Value("#{target.dataType?.id}")
    Integer getDataTypeId();

    int getColumnIndex();

    String getDescription();

    String getCharacterSet();

    String getCollation();

    boolean isUnique();

    NullableType getNullableType();

    int getLength();

    String getDefaultValue();

    boolean isAutoinc();

    boolean isDimension();

    int getPrecision();

    int getScale();

    boolean isFeatureParamCandidate();

    boolean isIgnore();

    AnalysisStatus getAnalysisStatus();
}
