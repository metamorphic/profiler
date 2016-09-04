package io.metamorphic.fileservices;

import akka.actor.Extension;
import akka.actor.Props;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

/**
 * Created by markmo on 5/10/2015.
 */
@Component
public class SpringExtension implements Extension {

    private ApplicationContext context;

    public void initialize(ApplicationContext context) {
        this.context = context;
    }

    public Props props(String actorBeanName) {
        return Props.create(SpringActorProducer.class, context, actorBeanName);
    }
}
