package io.metamorphic.fileservices;

import akka.actor.Actor;
import akka.actor.IndirectActorProducer;
import org.springframework.context.ApplicationContext;

/**
 * Created by markmo on 5/10/2015.
 */
public class SpringActorProducer implements IndirectActorProducer {

    private final ApplicationContext context;
    private final String actorBeanName;

    public SpringActorProducer(ApplicationContext context, String actorBeanName) {
        this.context = context;
        this.actorBeanName = actorBeanName;
    }

    @Override
    public Actor produce() {
        return (Actor) context.getBean(actorBeanName);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Class<? extends Actor> actorClass() {
        return (Class<? extends Actor>) context.getType(actorBeanName);
    }
}
