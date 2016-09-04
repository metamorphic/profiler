package io.metamorphic.fileservices;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

/**
 * Created by markmo on 8/10/2015.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration extends AbstractWebSocketMessageBrokerConfigurer {

    private static final Log log = LogFactory.getLog(WebSocketConfiguration.class);

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        log.info("Configuring Message Broker");
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registering Stomp Endpoints");
        registry.addEndpoint("/table-analysis-request").setAllowedOrigins("*").withSockJS();
        registry.addEndpoint("/spark-analysis-request").setAllowedOrigins("*").withSockJS();
    }
}
