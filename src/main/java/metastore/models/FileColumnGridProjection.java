package metastore.models;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@Projection(name = "grid", types = FileColumn.class)
public interface FileColumnGridProjection {

    String getName();

    String getEventPropertyTypesId();

    String getEventPropertyTypesName();

    @Value("#{target.dataset?.name}")
    String getDatasetName();

    @Value("#{target.dataset?.id}")
    Long getDatasetId();

    @Value("#{target.dataType?.name}")
    String getDataTypeName();

    @Value("#{target.dataType?.id}")
    Integer getDataTypeId();

    @Value("#{target.valueType?.name}")
    String getValueTypeName();

    @Value("#{target.valueType?.id}")
    Integer getValueTypeId();

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
