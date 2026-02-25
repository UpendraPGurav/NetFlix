import {
  inject,
  NgModule,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Landing } from './components/landing/landing';
import { SharedModule } from './shared/shared-module';
import { Signup } from './components/signup/signup';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Login } from './components/login/login';
import { VerifyEmail } from './components/verify-email/verify-email';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';
import { Home } from './components/user/home/home';
import { authInterceptor } from './shared/interceptors/auth-interceptor';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { AuthService } from './shared/services/auth-service';
import { ResetPassword } from './components/reset-password/reset-password';

@NgModule({
  declarations: [App, Landing, Signup, Login, VerifyEmail, Home, ForgotPassword, ResetPassword],
  imports: [BrowserModule, AppRoutingModule, SharedModule, MatIconModule, A11yModule],
  providers: [
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.initializeAuth();
    }),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
