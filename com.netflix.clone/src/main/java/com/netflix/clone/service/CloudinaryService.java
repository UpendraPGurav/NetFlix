package com.netflix.clone.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CloudinaryService {
    String uploadImage(MultipartFile file) throws IOException;
    String uploadVideo(MultipartFile file) throws IOException;
}

