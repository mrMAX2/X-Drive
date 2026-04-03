package com.xdrive.repository;

import com.xdrive.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByOwnerUsername(String ownerUsername);
    Optional<FileMetadata> findByIdAndOwnerUsername(Long id, String ownerUsername);
    List<FileMetadata> findByOwnerUsernameAndIsPublic(String ownerUsername, boolean isPublic);
    Optional<FileMetadata> findByShareToken(String shareToken);
    long countByOwnerUsername(String ownerUsername);
}
