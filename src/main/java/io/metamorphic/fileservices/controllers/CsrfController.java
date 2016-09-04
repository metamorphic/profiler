package io.metamorphic.fileservices.controllers;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by markmo on 19/10/2015.
 */
@RestController
public class CsrfController {

    @RequestMapping("/api/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }
}
