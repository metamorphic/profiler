package io.metamorphic.fileservices;

import akka.actor.ActorSystem;
import akka.dispatch.PriorityGenerator;
import akka.dispatch.UnboundedPriorityMailbox;
import com.typesafe.config.Config;

/**
 * Created by markmo on 6/10/2015.
 */
public class PriorityMailbox extends UnboundedPriorityMailbox {

    public PriorityMailbox(ActorSystem.Settings settings, Config config) {
        super(new PriorityGenerator() {
            @Override
            public int gen(Object message) {
                if (message instanceof DatabaseAnalysisTask) {
                    return ((DatabaseAnalysisTask) message).getPriority();
                } else {
                    // default
                    return 100;
                }
            }
        });
    }
}
