package com.xdrive.files;

import com.xdrive.dto.FileDto;
import com.xdrive.model.FileMetadata;
import com.xdrive.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private StorageService storageService;

    // ─── RULE 1: Never hardcode user — always pull from SecurityContext ───────
    private String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public FileDto uploadFile(MultipartFile file) {
        String currentUser = getCurrentUser();

        String storagePath = storageService.uploadFile(file, currentUser);

        FileMetadata metadata = FileMetadata.builder()
                .fileName(UUID.randomUUID().toString())
                .originalName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(storagePath)
                .ownerUsername(currentUser)
                .isPublic(false)
                .build();

        FileMetadata saved = fileRepository.save(metadata);
        return FileDto.from(saved);
    }

    // ─── RULE 2: Always validate ownership before returning data ─────────────
    public InputStream downloadFile(Long fileId) {
        String currentUser = getCurrentUser();

        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        if (!file.getOwnerUsername().equals(currentUser)) {
            throw new RuntimeException("Access Denied: You do not own this file");
        }

        return storageService.downloadFile(file.getStoragePath());
    }

    // Phase 2 Core: GET /api/files/my-files
    public List<FileDto> getMyFiles() {
        String currentUser = getCurrentUser();
        return fileRepository.findByOwnerUsername(currentUser)
                .stream()
                .map(FileDto::from)
                .collect(Collectors.toList());
    }

    public FileDto getFileById(Long fileId) {
        String currentUser = getCurrentUser();

        FileMetadata file = fileRepository.findByIdAndOwnerUsername(fileId, currentUser)
                .orElseThrow(() -> new RuntimeException("File not found or access denied"));

        return FileDto.from(file);
    }

    public void deleteFile(Long fileId) {
        String currentUser = getCurrentUser();

        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        if (!file.getOwnerUsername().equals(currentUser)) {
            throw new RuntimeException("Access Denied: You do not own this file");
        }

        storageService.deleteFile(file.getStoragePath());
        fileRepository.delete(file);
    }

    // Phase 3: Generate shareable link
    public String generateShareLink(Long fileId) {
        String currentUser = getCurrentUser();

        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        if (!file.getOwnerUsername().equals(currentUser)) {
            throw new RuntimeException("Access Denied: You do not own this file");
        }

        String shareToken = UUID.randomUUID().toString();
        file.setShareToken(shareToken);
        file.setPublic(true);
        fileRepository.save(file);

        return shareToken;
    }

    public InputStream downloadSharedFile(String shareToken) {
        FileMetadata file = fileRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Invalid or expired share link"));

        if (!file.isPublic()) {
            throw new RuntimeException("This file is no longer shared");
        }

        return storageService.downloadFile(file.getStoragePath());
    }

    public long getFileCount() {
        String currentUser = getCurrentUser();
        return fileRepository.countByOwnerUsername(currentUser);
    }
}
