package com.bamby.jwt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JwtDemoApplication {
    public static void main(String[] args) {
        System.out.println(">>> BAMBY NEW BUILD " + System.currentTimeMillis());
        SpringApplication.run(JwtDemoApplication.class, args);
    }

}
