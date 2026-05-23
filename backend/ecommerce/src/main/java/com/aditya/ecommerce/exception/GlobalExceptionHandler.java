package com.aditya.ecommerce.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.aditya.ecommerce.dto.common.ApiErrorResponseDTO;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;




@RestControllerAdvice
public class GlobalExceptionHandler {
    private ApiErrorResponseDTO buildError(HttpStatus status, String message, HttpServletRequest request){
        return new ApiErrorResponseDTO(LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleBadRequest(
            BadRequestException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponseDTO error = buildError(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleUnauthorized(
            UnauthorizedException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponseDTO error = buildError(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                request
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleForbidden(
            ForbiddenException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponseDTO error = buildError(
                HttpStatus.FORBIDDEN,
                ex.getMessage(),
                request
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleResourceNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponseDTO error = buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleConflict(
            ConflictException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponseDTO error = buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                request
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponseDTO> handleFallback(
             Exception ex,
            HttpServletRequest request
    ) {
        ApiErrorResponseDTO error = buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(),
                request
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
