import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';
import { NotificationService } from '../../shared/services/notification-service';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit {
  hidePassword = true;
  hideConfirmPassword = true;
  signUpForm!: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private errorHandlerService: ErrorHandlerService,
    private notification: NotificationService,
  ) {
    this.signUpForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [
        '',
        [Validators.required, this.authService.passwordMatchValidator('password')],
      ],
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
    }

    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.signUpForm.patchValue({ email: email });
      console.log(email);
    }
  }

  submit() {
    this.loading = true;
    const formData = this.signUpForm.value;
    const data = {
      email: formData.email?.trim().toLowerCase(),
      password: formData.password,
      fullName: formData.fullName,
    };

    this.authService.signup(data).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.notification.success(response?.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorHandlerService.handle(err, 'Registration failed. Please try again.');
      },
    });
  }
}
