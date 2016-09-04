package io.metamorphic.fileservices;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by markmo on 18/10/2015.
 */
public class CsrfHeaderDebugFilter extends OncePerRequestFilter {

    private static final Log log = LogFactory.getLog(CsrfHeaderDebugFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (log.isDebugEnabled()) {
            log.debug(getClass().getName() + ".doFilterInternal called");
            log.debug(request.getRequestURI());
        }
        String actualToken = request.getHeader("X-CSRF-TOKEN");
        String expectedToken = null;
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            expectedToken = csrfToken.getToken();
        }
        if (log.isDebugEnabled()) {
            log.debug("expected token: " + expectedToken);
            log.debug("actual token: " + actualToken);
        }
        filterChain.doFilter(request, response);
    }
}
