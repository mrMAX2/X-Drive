package com.xdrive.files;

import com.xdrive.dto.ApiResponse;
import com.xdrive.dto.FileDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    // POST /api/files/upload
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse.Response<FileDto>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        try {
            FileDto uploaded = fileService.uploadFile(file);
            return ResponseEntity.ok(ApiResponse.Response.success(uploaded, "File uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.Response.error(e.getMessage()));
        }
    }

    // GET /api/files/my-files  ← Phase 2 Core Feature
    @GetMapping("/my-files")
    public ResponseEntity<ApiResponse.Response<List<FileDto>>> getMyFiles() {
        List<FileDto> files = fileService.getMyFiles();
        return ResponseEntity.ok(ApiResponse.Response.success(files,
                "Retrieved " + files.size() + " files"));
    }

    // GET /api/files/{id}
    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable Long id) {
        try {
            FileDto fileInfo = fileService.getFileById(id);
            InputStream stream = fileService.downloadFile(id);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileInfo.getOriginalName() + "\"")
                    .contentType(MediaType.parseMediaType(
                            fileInfo.getContentType() != null ? fileInfo.getContentType() : "application/octet-stream"
                    ))
                    .body(new InputStreamResource(stream));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    // DELETE /api/files/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse.Response<Void>> deleteFile(@PathVariable Long id) {
        try {
            fileService.deleteFile(id);
            return ResponseEntity.ok(ApiResponse.Response.success(null, "File deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.Response.error(e.getMessage()));
        }
    }

    // POST /api/files/{id}/share
    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse.Response<Map<String, String>>> shareFile(@PathVariable Long id) {
        try {
            String token = fileService.generateShareLink(id);
            return ResponseEntity.ok(ApiResponse.Response.success(
                    Map.of("shareToken", token, "shareUrl", "/api/files/shared/" + token),
                    "Share link generated"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.Response.error(e.getMessage()));
        }
    }

    // GET /api/files/shared/{token}  ← Public endpoint (no JWT needed)
    @GetMapping("/shared/{token}")
    public ResponseEntity<InputStreamResource> downloadSharedFile(@PathVariable String token) {
        try {
            InputStream stream = fileService.downloadSharedFile(token);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new InputStreamResource(stream));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).build();
        }
    }
}
