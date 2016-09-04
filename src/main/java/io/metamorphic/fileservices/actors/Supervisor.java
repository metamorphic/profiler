package io.metamorphic.fileservices.actors;

import akka.actor.ActorRef;
import akka.actor.Terminated;
import akka.actor.UntypedActor;
import akka.event.Logging;
import akka.event.LoggingAdapter;
import akka.routing.ActorRefRoutee;
import akka.routing.Routee;
import akka.routing.Router;
import akka.routing.SmallestMailboxRoutingLogic;
import io.metamorphic.fileservices.DatabaseAnalysisTask;
import io.metamorphic.fileservices.SparkAnalysisTask;
import io.metamorphic.fileservices.SpringExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by markmo on 6/10/2015.
 */
@Component
@Scope("prototype")
public class Supervisor extends UntypedActor {

    private final LoggingAdapter log = Logging.getLogger(getContext().system(), "Supervisor");

    final static int NUMBER_ROUTEES = 3;

    @Autowired
    private SpringExtension extension;

    private Router databaseAnalysisRouter;
    private Router sparkAnalysisRouter;

    @Override
    public void preStart() throws Exception {
        log.info("Starting up");
        databaseAnalysisRouter = makeRouter("databaseAnalysisTaskActor");
        sparkAnalysisRouter = makeRouter("sparkAnalysisTaskActor");
        super.preStart();
    }

    private Router makeRouter(String actorName) {
        List<Routee> routees = new ArrayList<>();
        for (int i = 0; i < NUMBER_ROUTEES; i++) {
            ActorRef actor = getContext().actorOf(extension.props(actorName));
            getContext().watch(actor);
            routees.add(new ActorRefRoutee(actor));
        }
        return new Router(new SmallestMailboxRoutingLogic(), routees);
    }

    @Override
    public void onReceive(Object message) throws Exception {
        if (message instanceof DatabaseAnalysisTask) {
            databaseAnalysisRouter.route(message, getSender());
        } else if (message instanceof SparkAnalysisTask) {
            sparkAnalysisRouter.route(message, getSender());
        } else if (message instanceof Terminated) {
            databaseAnalysisRouter = databaseAnalysisRouter.removeRoutee(((Terminated) message).actor());
            ActorRef actor = getContext().actorOf(extension.props("databaseAnalysisTaskActor"));
            getContext().watch(actor);
            databaseAnalysisRouter = databaseAnalysisRouter.addRoutee(new ActorRefRoutee(actor));

            sparkAnalysisRouter = sparkAnalysisRouter.removeRoutee(((Terminated) message).actor());
            ActorRef sparkAnalysisActor = getContext().actorOf(extension.props("sparkAnalysisTaskActor"));
            getContext().watch(sparkAnalysisActor);
            sparkAnalysisRouter = sparkAnalysisRouter.addRoutee(new ActorRefRoutee(sparkAnalysisActor));

        } else {
            log.error("Unable to handle message {}", message);
        }
    }

    @Override
    public void postStop() throws Exception {
        log.info("Shutting down");
        super.postStop();
    }
}
