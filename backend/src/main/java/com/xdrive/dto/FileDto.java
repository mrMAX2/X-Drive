package com.xdrive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileDto {
    private Long id;
    private String fileName;
    private String originalName;
    private String contentType;
    private Long fileSize;
    private String ownerUsername;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private String downloadUrl;

    public static FileDto from(com.xdrive.model.FileMetadata file) {
        return FileDto.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .originalName(file.getOriginalName())
                .contentType(file.getContentType())
                .fileSize(file.getFileSize())
                .ownerUsername(file.getOwnerUsername())
                .isPublic(file.isPublic())
                .createdAt(file.getCreatedAt())
                .downloadUrl("/api/files/" + file.getId())
                .build();
    }
}
