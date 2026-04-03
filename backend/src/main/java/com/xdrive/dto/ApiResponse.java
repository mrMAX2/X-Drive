package com.xdrive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// ============ API WRAPPER ============
public class ApiResponse {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response<T> {
        private String status;
        private T data;
        private String message;

        public static <T> Response<T> success(T data, String message) {
            return Response.<T>builder()
                    .status("success")
                    .data(data)
                    .message(message)
                    .build();
        }

        public static <T> Response<T> error(String message) {
            return Response.<T>builder()
                    .status("error")
                    .data(null)
                    .message(message)
                    .build();
        }
    }
}
