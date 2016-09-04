package io.metamorphic.fileservices.controllers;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.Map;

/**
 * Created by markmo on 14/10/2015.
 */
@RestController
public class SessionController {

    private static final Log log = LogFactory.getLog(SessionController.class);

    @RequestMapping("/api/token")
    @ResponseBody
    public Map<String, String> token(HttpSession session) {
        return Collections.singletonMap("token", session.getId());
    }

    @RequestMapping(value = "/api/logout", method = RequestMethod.POST)
    @ResponseBody
    public String logout(HttpSession session) {
        if (log.isDebugEnabled()) {
            log.debug("logging out");
        }
        if (session != null) {
            if (log.isDebugEnabled()) {
                log.debug("Invalidating session: " + session.getId());
            }
            session.invalidate();
        }
        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(null);
        SecurityContextHolder.clearContext();
        return "OK";
    }
}
