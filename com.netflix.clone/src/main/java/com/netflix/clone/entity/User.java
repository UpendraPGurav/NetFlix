package com.netflix.clone.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.netflix.clone.enums.Role;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@ToString
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false)
    private boolean active=true;

    @Column(nullable = false)
    private boolean emailVerified=false;

    @Column(unique = true)
    private String verificationToken;

    @Column
    private Instant verificationTokenExpiration;

    @Column
    private String passwordResetToken;

    @Column
    private Instant passwordResetTokenExpiration;

    @CreationTimestamp
    @Column(nullable = false,updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_watchList",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "video_id")
    )
    private Set<Video> watchList = new HashSet<>();

    public void addWatchList(Video video) {
        this.watchList.add(video);
    }

    public void removeFromWatchList(Video video) {
        this.watchList.remove(video);
    }
}
