import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { Signup } from './components/signup/signup';
import { Login } from './components/login/login';
import { VerifyEmail } from './components/verify-email/verify-email';
import { Home } from './components/user/home/home';
import { authGuard } from './Guards/auth-guard';
import { adminGuard } from './Guards/admin-guard';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';

const routes: Routes = [
  { path: '', component: Landing },
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'home', component: Home, canActivate: [authGuard] },
  {
    path: 'admin',
    loadChildren: () => import('../app/admin/admin-module').then((m) => m.AdminModule),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
