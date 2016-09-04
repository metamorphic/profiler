package io.metamorphic.fileservices.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Created by markmo on 14/10/2015.
 */
@RestController
public class UserController {

    @RequestMapping("/api/user")
    public Principal user(Principal user) {
        return user;
    }
}
