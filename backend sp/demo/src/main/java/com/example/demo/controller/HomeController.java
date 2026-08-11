package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Patent Form Backend is running";
    }

    @GetMapping("/health")
    public String health() {
        return "Patent Form Backend is running";
    }
}
