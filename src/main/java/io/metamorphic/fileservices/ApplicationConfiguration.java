package io.metamorphic.fileservices;

import akka.actor.ActorSystem;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

/**
 * Created by markmo on 5/10/2015.
 */
@Configuration
@Lazy
public class ApplicationConfiguration {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private SpringExtension extension;

    @Bean
    public ActorSystem actorSystem() {
        ActorSystem system = ActorSystem.create("AkkaTaskProcessing", akkaConfiguration());
        extension.initialize(context);
        return system;
    }

    @Bean
    public Config akkaConfiguration() {
        return ConfigFactory.load();
    }
}
