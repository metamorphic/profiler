package metastore.models;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.sql.Time;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@Projection(name = "grid", types = FileDataset.class)
public interface FileDatasetGridProjection {

    Long getId();

    String getName();

    FileType getFileType();

    String getEventTypesId();

    String getNaturalKeyColumnsId();

    String getCustomerIdMappingRulesId();

    @Value("#{target.dataSource?.name}")
    String getDataSourceName();

    @Value("#{target.dataSource?.id}")
    Long getDataSourceId();

    @Value("#{target.securityClassification?.name}")
    String getSecurityClassificationName();

    @Value("#{target.securityClassification?.id}")
    Integer getSecurityClassificationId();

    String getNamespace();

    String getDescription();

    String getComments();

    String getArchitectureDomain();

    String getContactPerson();

    boolean isCustomerData();

    boolean isFinancialBankingData();

    boolean isIdAndServiceHistory();

    boolean isCreditCardData();

    boolean isFinancialReportingData();

    boolean isPrivacyData();

    boolean isRegulatoryData();

    boolean isNbnConfidentialData();

    boolean isNbnCompliant();

    String getSsuReady();

    String getSsuRemediationMethod();

    TimeUnit getAvailableHistoryUnitOfTime();

    int getAvailableHistoryUnits();

    int getHistoryDataSizeGb();

    int getRefreshDataSizeGb();

    boolean isBatch();

    TimeUnit getRefreshFrequencyUnitOfTime();

    int getRefreshFrequencyUnits();

    Time getTimeOfDayDataAvailable();

    TimeUnit getDataAvailableUnitOfTime();

    String getDataAvailableDaysOfWeek();

    TimeUnit getDataLatencyUnitOfTime();

    int getDataLatencyUnits();

    String getColumnDelimiter();

    boolean isHeaderRow();

    boolean isFooterRow();

    String getRowDelimiter();

    String getTextQualifier();

    CompressionType getCompressionType();

    boolean isMultiRecordset();

    AnalysisStatus getAnalysisStatus();
}
