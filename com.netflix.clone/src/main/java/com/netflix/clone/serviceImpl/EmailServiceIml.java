package com.netflix.clone.serviceImpl;

import com.netflix.clone.exception.EmailNotVerifiedException;
import com.netflix.clone.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceIml implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceIml.class);

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;
    @Autowired
    private MailSender mailSender;

    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("NetFlix clone - verify your email");
            String verificationLink = frontendUrl + "/verify-email?token=" + token;
            String emailBody =
                    "Welcome to NetFlix clone !\n\n"
                            + "Thank you for registering. Please verify your email address by clicking link below:\n\n"
                            + verificationLink
                            + "\n\n"
                            + "This link will expire in 24 hrs.\n\n"
                            + "If you didn't create this account, please ignore this email."
                            + "Best regards,\n"
                            + "Netflix Clone Team";

            message.setText(emailBody);
            mailSender.send(message);
            logger.info("Verification email sent to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
            throw new EmailNotVerifiedException("Failed to send verification email");
        }
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("NetFlix clone - reset your email");
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            String emailBody =
                    "Hi,\n\n"
                            + "We recieved a request to reset your password. Click the link below to reset your password."
                            + resetLink
                            + "\n\n"
                            + "This request link will expire in 1 hour.\n\n"
                            + "If you didn't request a password reset, please ignore this email.\n\n"
                            + "Best regards,\n"
                            + "Netflix Clone Team";
            message.setText(emailBody);
            mailSender.send(message);
            logger.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
            throw new EmailNotVerifiedException("Failed to send password reset email");
        }
    }
}
