package io.metamorphic.fileservices;

import com.fasterxml.jackson.datatype.hibernate4.Hibernate4Module;
import io.metamorphic.analysisservices.AnalysisService;
import io.metamorphic.analysisservices.AnalysisServiceImpl;
import io.metamorphic.sparkprofiler.SparkAnalysisService;
import io.metamorphic.sparkprofiler.SparkAnalysisServiceImpl;
import org.springframework.boot.autoconfigure.jdbc.DataSourceBuilder;
import org.springframework.boot.autoconfigure.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.hibernate.SpringNamingStrategy;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

import javax.sql.DataSource;
import java.util.Map;

/**
 * Created by markmo on 15/08/2015.
 */
@Configuration
@EnableJpaRepositories(basePackages = "io.metamorphic.fileservices.repositories", entityManagerFactoryRef = "entityManagerFactory")
public class ProfilerConfiguration implements EnvironmentAware {

    private RelaxedPropertyResolver jpaPropertyResolver;

    @Override
    public void setEnvironment(Environment environment) {
        this.jpaPropertyResolver = new RelaxedPropertyResolver(environment, "spring.jpa.");
    }

    @Bean
    FileService fileService() {
        return new FileServiceImpl();
    }

    @Bean
    AnalysisService analysisService() {
        return new AnalysisServiceImpl();
    }

    @Bean
    SparkAnalysisService sparkAnalysisService() {
        return new SparkAnalysisServiceImpl();
    }

    @ConfigurationProperties(prefix = "spring.datasource")
    @Bean
    @Primary
    public DataSource profilerDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "entityManagerFactory")
    @Primary
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(EntityManagerFactoryBuilder builder) {
        LocalContainerEntityManagerFactoryBean bean = builder
                .dataSource(profilerDataSource())
                .packages("metastore.models")
                .build();
        Map<String, Object> properties = bean.getJpaPropertyMap();
        properties.put("hibernate.ejb.naming_strategy", jpaPropertyResolver.getProperty("hibernate.naming-strategy", SpringNamingStrategy.class.getName()));
        return bean;
    }

    /**
     * Enables JSON serialization of lazily fetched properties
     *
     * @return Jackson2ObjectMapperBuilder
     */
    @Bean
    public Jackson2ObjectMapperBuilder configureObjectMapper() {
        return new Jackson2ObjectMapperBuilder()
                .modulesToInstall(Hibernate4Module.class);
    }
}
