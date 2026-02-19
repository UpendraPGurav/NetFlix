package com.netflix.clone.dao;

import com.netflix.clone.entity.User;
import com.netflix.clone.entity.Video;
import com.netflix.clone.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String token);

    Long countByRoleAndActive(Role role, boolean active);

    @Query("SELECT u from User u where lower(u.fullName) like lower(concat('%',:search,'%')) Or lower(u.email) like lower(concat('%',:search,'%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    Long countByRole(Role role);

    @Query("select v.id from User u join u.watchList v where u.email =:email and v.id in :videoIds")
    Set<Long> findWatchListVideoIds(@Param("email") String email, @Param("videoIds") List<Long> videoIds);

    @Query("""
            select v from User u 
            join u.watchList v 
            where u.id = :userId 
            and v.published = true 
            and (
                 lower(v.title) like lower(concat('%', :search, '%')) 
                 or lower(v.description) like lower(concat('%', :search, '%'))
            )
            """)
    Page<Video> searchWatchlistByUserId(
            @Param("userId") Long userId,
            @Param("search") String search,
            Pageable pageable
    );


    @Query("""
            select v from User u 
            join u.watchList v 
            where u.id = :userId 
            and v.published = true
            """)
    Page<Video> findWatchlistByUserId(
            @Param("userId") Long userId,
            Pageable pageable
    );

}
