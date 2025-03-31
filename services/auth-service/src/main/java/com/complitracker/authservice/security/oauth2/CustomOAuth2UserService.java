package com.complitracker.authservice.security.oauth2;

import com.complitracker.authservice.exception.OAuth2AuthenticationProcessingException;
import com.complitracker.authservice.model.ERole;
import com.complitracker.authservice.model.Role;
import com.complitracker.authservice.model.User;
import com.complitracker.authservice.repository.RoleRepository;
import com.complitracker.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class CustomOAuth2UserService extends OidcUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oidcUser);
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OidcUser processOAuth2User(OidcUserRequest userRequest, OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getAuthProvider().equals(userRequest.getClientRegistration().getRegistrationId())) {
                throw new OAuth2AuthenticationProcessingException(
                    "You're signed up with " + user.getProvider() + ". Please use your " + 
                    user.getAuthProvider() + " account to login.");
            }
            user = updateExistingUser(user, oidcUser);
        } else {
            user = registerNewUser(userRequest, oidcUser);
        }

        return oidcUser;
    }

    private User registerNewUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        User user = new User();
        user.setProvider(userRequest.getClientRegistration().getRegistrationId());
        user.setProviderId(oidcUser.getSubject());
        user.setName(oidcUser.getEmail());
        user.setEmail(oidcUser.getEmail());
        user.setEnabled(true);

        // Set default role as USER
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
            .orElseThrow(() -> new RuntimeException("Error: Role USER is not found."));
        roles.add(userRole);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    private User updateExistingUser(User user, OidcUser oidcUser) {
        user.setEmail(oidcUser.getEmail());
        return userRepository.save(user);
    }
}