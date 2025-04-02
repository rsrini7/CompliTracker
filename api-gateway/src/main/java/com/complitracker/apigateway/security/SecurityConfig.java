package com.complitracker.apigateway.security;

import java.util.Arrays;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Autowired
    private JwtConfig jwtConfig;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
        ServerHttpSecurity http
    ) {
        return http
            .csrf()
            .disable()
            .cors()
            .configurationSource(corsConfigurationSource())
            .and()
            .authorizeExchange()
            .pathMatchers("/api/auth/**")
            .permitAll()
            .pathMatchers("/actuator/**")
            .permitAll()
            .pathMatchers("/fallback/**")
            .permitAll()
            .pathMatchers("/api/public/**")
            .permitAll()
            .anyExchange()
            .authenticated()
            .and()
            .addFilterAt(
                new JwtAuthenticationFilter(jwtConfig),
                SecurityWebFiltersOrder.AUTHENTICATION
            )
            .securityContextRepository(
                NoOpServerSecurityContextRepository.getInstance()
            )
            .httpBasic()
            .disable()
            .formLogin()
            .disable()
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(
            Collections.singletonList("http://localhost:5173")
        );
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(
            Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        );
        corsConfig.setAllowedHeaders(
            Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept"
            )
        );
        corsConfig.setExposedHeaders(Arrays.asList("Authorization"));
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return source;
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        return new CorsWebFilter(corsConfigurationSource());
    }
}
