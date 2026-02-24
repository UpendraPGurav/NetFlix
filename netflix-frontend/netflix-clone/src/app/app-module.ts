import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Landing } from './components/landing/landing';
import { SharedModule } from './shared/shared-module';
import { Signup } from './components/signup/signup';
import { provideHttpClient } from '@angular/common/http';
import { Login } from './components/login/login';
import { VerifyEmail } from './components/verify-email/verify-email';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from "@angular/cdk/a11y";

@NgModule({
  declarations: [
    App,
    Landing,
    Signup,
    Login,
    VerifyEmail
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    MatIconModule,
    A11yModule
],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
