package com.netflix.clone.util;

import java.nio.file.Files;
import java.nio.file.Path;

public class FileHandlerUtil {

    private FileHandlerUtil() {
    }

    public static String extractFileExtension(String originalFilename) {
        String fileExtension="";
        if(originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return fileExtension;
    }

    public static Path findFileByUuid(Path directory, String uuid) throws Exception {
        return Files.list(directory)
                .filter(path -> path.getFileName().toString().startsWith(uuid))
                .findFirst()
                .orElseThrow(() -> new Exception("File Not Found for UUID: " + uuid));
    }

    public static String detectVideoContentType(String fileName) {
        if(fileName == null) {
            return "video/mp4";
        }

        if(fileName.endsWith(".webm")) return "video/webm";
        if(fileName.endsWith(".ogg")) return "video/ogg";
        if(fileName.endsWith(".mkv")) return "video/x-matroska";
        if(fileName.endsWith(".avi")) return "video/x-msvideo";
        if(fileName.endsWith(".mov")) return "video/quicktime";
        if(fileName.endsWith(".flv")) return "video/x-flv";
        if(fileName.endsWith(".wmv")) return "video/x-ms-wmv";
        if(fileName.endsWith(".m4v")) return "video/x-m4v";
        if(fileName.endsWith(".3gp")) return "video/3gpp";
        if(fileName.endsWith(".mpg") || fileName.endsWith(".mpeg") ) return "video/mpeg";

        return "video/mp4";
    }

    public static String detectImageContentType(String fileName) {
        if(fileName == null) return "image/jpeg";

        if(fileName.endsWith(".png")) return "image/png";
        if(fileName.endsWith(".gif")) return "image/gif";
        if(fileName.endsWith(".webp")) return "image/webp";

        return "image/jpeg";
    }
}

