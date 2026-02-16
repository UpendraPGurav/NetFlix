package com.netflix.clone.dao;

import com.netflix.clone.entity.User;
import com.netflix.clone.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
   Optional<User> findByEmail(String email);

   boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String token);

    Long countByRoleAndActive(Role role, boolean active);

    @Query("SELECT u from User u where lower(u.fullName) like lower(concat('%',:search,'%')) Or lower(u.email) like lower(concat('%',:search,'%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    Long countByRole(Role role);
}
