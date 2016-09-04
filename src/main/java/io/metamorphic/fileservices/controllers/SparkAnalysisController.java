package io.metamorphic.fileservices.controllers;

import akka.actor.ActorRef;
import akka.actor.ActorSystem;
import io.metamorphic.fileservices.SparkAnalysisTask;
import io.metamorphic.fileservices.SpringExtension;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

/**
 * Created by markmo on 26/10/2015.
 */
@Controller
public class SparkAnalysisController {

    private static final Log log = LogFactory.getLog(SparkAnalysisController.class);

    @Autowired
    private ActorSystem actorSystem;

    @Autowired
    private SpringExtension extension;

    @MessageMapping("/spark-analysis-request")
    public void analyze() throws Exception {
        if (log.isDebugEnabled()) {
            log.debug("analyze Spark source from websocket message");
        }
        ActorRef supervisor = actorSystem.actorOf(extension.props("supervisor").withMailbox("akka.priority-mailbox"));
        // start akka task
        SparkAnalysisTask task = new SparkAnalysisTask();
        task.setPriority(1);
        supervisor.tell(task, null);
    }
}
