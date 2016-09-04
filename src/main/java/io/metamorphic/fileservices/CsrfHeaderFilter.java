package io.metamorphic.fileservices;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Set-Cookie header not passed through gateway. Abandon this approach.
 *
 * TODO
 * Investigate reason. Could be config in Zuul.
 *
 * Use CSRF API call instead.
 *
 * @see io.metamorphic.fileservices.controllers.CsrfController
 *
 * Created by markmo on 18/10/2015.
 */
public class CsrfHeaderFilter extends OncePerRequestFilter {

    private static final Log log = LogFactory.getLog(CsrfHeaderFilter.class);

    private static final String PARAM_NAME = "X-CSRF-TOKEN";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (log.isDebugEnabled()) {
            log.debug(getClass().getName() + ".doFilterInternal called");
        }
        CsrfToken csrf = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrf != null) {
            if (log.isDebugEnabled()) {
                log.debug("CSRF token: " + csrf.getToken());
            }
            Cookie cookie = WebUtils.getCookie(request, PARAM_NAME);
            if (log.isDebugEnabled()) {
                log.debug("Cookie: " + (cookie == null ? "null" : cookie.getValue()));
            }
            String token = csrf.getToken();
            if (cookie == null || token != null && !token.equals(cookie.getValue())) {
                if (log.isDebugEnabled()) {
                    log.debug("Setting CSRF cookie and header");
                }
                cookie = new Cookie(PARAM_NAME, token);

                // TODO
                // set to app context
                cookie.setPath("/");
                response.addCookie(cookie);

                // header not passed through gateway either
                response.addHeader(PARAM_NAME, token);
            }
        }
        filterChain.doFilter(request, response);
    }
}
