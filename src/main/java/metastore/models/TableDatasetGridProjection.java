package metastore.models;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

/**
 * @author Mark Moloney <markmo @ metamorphic.io>
 * Copyright 2015
 */
@Projection(name = "grid", types = TableDataset.class)
public interface TableDatasetGridProjection {

    Long getId();

    String getName();

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

    AnalysisStatus getAnalysisStatus();
}
