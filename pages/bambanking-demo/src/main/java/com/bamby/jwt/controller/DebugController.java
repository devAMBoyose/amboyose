package com.bamby.jwt.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/bambanking/debug")
public class DebugController {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @GetMapping("/db-check")
    public String checkDb() {
        return "DB CONNECT URL = " + mongoUri;
    }
}
