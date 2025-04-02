package com.complitracker.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.UnsupportedJwtException;

@Component
@Slf4j
public class JwtTokenFilter
    extends AbstractGatewayFilterFactory<JwtTokenFilter.Config> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    public JwtTokenFilter() {
        super(Config.class);
    }

    private byte[] getSigningKey() {
        // This is the original, incorrect version that Base64 encodes the key
        return java.util.Base64.getEncoder().encode(jwtSecret.getBytes());
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().value();

            log.info("Processing request: {} {}", request.getMethod(), path);

            // Log all headers for debugging
            request.getHeaders().forEach((name, values) -> {
                values.forEach(value -> log.info("Header: {} = {}", name, value));
            });

            // Skip authentication for public endpoints
            if (
                path.startsWith("/api/auth/") ||
                path.startsWith("/actuator/") ||
                path.startsWith("/fallback/") ||
                path.startsWith("/api/public/")
            ) {
                return chain.filter(exchange);
            }

            if (!request.getHeaders().containsKey("Authorization")) {
                return onError(
                    exchange,
                    "No Authorization header",
                    HttpStatus.UNAUTHORIZED
                );
            }

            String token = request.getHeaders().getFirst("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            } else {
                return onError(
                    exchange,
                    "Invalid Authorization format",
                    HttpStatus.UNAUTHORIZED
                );
            }

            try {
                log.info("Attempting to validate token: {}", token);
                byte[] signingKey = getSigningKey();
                log.info("Using signing key (length): {}", signingKey.length);
                log.info("Validating JWT token...");
                // Verify the token is valid using the same method as auth service
                Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token)
                    .getBody();

                // Log successful validation - for debugging
                log.info(
                    "Token validated successfully for user: {}",
                    claims.getSubject()
                );

                // Add user information to headers for downstream services
                ServerHttpRequest modifiedRequest = exchange
                    .getRequest()
                    .mutate()
                    .header("X-User-Id", claims.getSubject())
                    .build();

                return chain.filter(
                    exchange.mutate().request(modifiedRequest).build()
                );
            } catch (SignatureException e) {
                log.error("Invalid JWT signature for token: {}. Error: {}", token, e.getMessage(), e);
                return onError(exchange, "Invalid JWT signature", HttpStatus.UNAUTHORIZED);
            } catch (MalformedJwtException e) {
                log.error("Invalid JWT token format: {}. Error: {}", token, e.getMessage(), e);
                return onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
            } catch (ExpiredJwtException e) {
                log.error("JWT token is expired: {}. Error: {}", token, e.getMessage(), e);
                return onError(exchange, "JWT token is expired", HttpStatus.UNAUTHORIZED);
            } catch (UnsupportedJwtException e) {
                log.error("JWT token is unsupported: {}. Error: {}", token, e.getMessage(), e);
                return onError(exchange, "JWT token is unsupported", HttpStatus.UNAUTHORIZED);
            } catch (IllegalArgumentException e) {
                log.error("JWT claims string is empty for token: {}. Error: {}", token, e.getMessage(), e);
                return onError(exchange, "JWT claims string is empty", HttpStatus.UNAUTHORIZED);
            } catch (Exception e) {
                log.error("General error validating token: {}. Error: {}", token, e.getMessage(), e);
                return onError(exchange, "Invalid token: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(
        ServerWebExchange exchange,
        String err,
        HttpStatus httpStatus
    ) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Put configuration properties here
    }
}
