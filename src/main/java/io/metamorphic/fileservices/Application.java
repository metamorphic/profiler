package io.metamorphic.fileservices;

import akka.actor.ActorSystem;
import akka.event.Logging;
import akka.event.LoggingAdapter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.http.HeaderHttpSessionStrategy;

/**
 * Created by markmo on 6/07/2015.
 */
@SpringBootApplication
@EnableAutoConfiguration(exclude = MongoAutoConfiguration.class)
@EnableRedisHttpSession
public class Application {

//    private static ApplicationContext context;
//    private static LoggingAdapter log;

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(Application.class, args);
        ActorSystem system = context.getBean(ActorSystem.class);
        LoggingAdapter log = Logging.getLogger(system, "Application");
        log.info("Starting up");
    }

//    public static void shutdown() throws Exception {
//        if (log.isDebugEnabled()) {
//            log.debug("Application shutting down");
//        }
//        ActorSystem system = context.getBean(ActorSystem.class);
//        SpringExtension extension = context.getBean(SpringExtension.class);
//        ActorRef supervisor = system.actorOf(extension.props("supervisor").withMailbox("akka.priority-mailbox"));
//        supervisor.tell(PoisonPill.getInstance(), null);
//        while (!supervisor.isTerminated()) {
//            Thread.sleep(100);
//        }
//        log.info("Shutting down");
//        system.shutdown();
//        system.awaitTermination();
//    }

    @Configuration
    @EnableWebSecurity
    @Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)
    protected static class SecurityConfiguration extends WebSecurityConfigurerAdapter {

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                    .httpBasic().and()
                    .authorizeRequests()
                        .antMatchers(
                                "/api/logout",
                                "/table-analysis-request/**",
                                "/spark-analysis-request/**"
                        ).permitAll()
                        .anyRequest().authenticated()
            //.and()
            //.addFilterAfter(new CsrfHeaderFilter(), CsrfFilter.class)
            ;
        }
    }

    @Bean
    HeaderHttpSessionStrategy sessionStrategy() {
        return new HeaderHttpSessionStrategy();
    }
}
