import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user-service';
import { AuthService } from '../../shared/services/auth-service';
import { DialogService } from '../../shared/services/dialog-service';
import { NotificationService } from '../../shared/services/notification-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  paginatedUsers: any = [];
  loadingMore = false;
  loading = true;
  error = false;
  currentUserEmail: string | null = null;
  searchQuery: string = '';

  pageSize = 3;
  currentPage = 0;
  totalPages = 0;
  hasMoreUsers = true;
  totalUsers: any;

  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialogService: DialogService,
    private notification: NotificationService,
    private errorHandlerService: ErrorHandlerService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser?.email || null;
    this.loadUsers();

    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchText) => {
      if (searchText.length >= 3 || searchText.length === 0) {
        this.currentPage = 0;
        this.loadUsers();
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && this.hasMoreUsers) {
      this.loadMoreUsers();
    }
  }

  loadUsers() {
    this.loading = true;
    this.error = false;
    this.currentPage = 0;
    this.paginatedUsers = [];
    const search = this.searchQuery.trim() || undefined;

    this.userService.getAllUsers(this.currentPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.paginatedUsers = response.content;
        console.log('paginated users', this.paginatedUsers);
        this.totalUsers = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.hasMoreUsers = response.number < this.totalPages - 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
        this.errorHandlerService.handle(err, 'Failed to load users');
      },
    });
  }

  loadMoreUsers() {
    if (this.loadingMore || !this.hasMoreUsers) {
      return;
    }
    // if (this.loadingMore || !this.hasMoreUsers) {
    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.userService.getAllUsers(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.paginatedUsers = [...this.paginatedUsers, ...response.content];
        this.currentPage = response.number;
        this.hasMoreUsers = response.number < response.totalPages - 1;
        this.loadingMore = false;
      },
      error: (err) => {
        this.loadingMore = false;
        this.errorHandlerService.handle(err, 'Failed to load more users');
      },
    });
    // }
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.trim();
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadUsers();
  }

  createUser() {
    const dialogRef = this.dialogService.openManageUserDialog('create');
    dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.loadUsers();
      }
    });
  }

  editUser(user: any) {
    const dialogRef = this.dialogService.openManageUserDialog('edit', user);
    dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.loadUsers();
      }
    });
  }

  isCurrentUser(user: any): boolean {
    return user.email === this.currentUserEmail;
  }

  toggleUserStatus(user: any): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (res: any) => {
        this.notification.success(res.message);
        this.loadUsers();
      },
    });
  }

  deleteUser(user: any) {
    this.dialogService
      .openConfirmation(
        'Delete User?',
        `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
        'Delete',
        'Cancel',
        'danger',
      )
      .subscribe((response) => {
        if (response) {
          this.userService.deleteUser(user.id).subscribe({
            next: (response: any) => {
              this.notification.success(response?.message);
              this.loadUsers();
            },
            error: (err) => {
              this.errorHandlerService.handle(err, 'Failed to delete user.Please try again later');
            },
          });
        }
      });
  }

  changeUserRole(user: any) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    this.dialogService
      .openConfirmation(
        'Change User Role?',
        `Are you sure you want to change ${user.fullName}'s role to ${newRole}.`,
        'Change Role',
        'Cancel',
        'warning',
      )
      .subscribe((response) => {
        if (response) {
          this.userService.changeUserRole(user.id, newRole).subscribe({
            next: (response: any) => {
              this.notification.success(response?.message);
              this.loadUsers();
            },
            error: (err) => {
              this.errorHandlerService.handle(
                err,
                'Failed to change user role.Please try again later',
              );
            },
          });
        }
      });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'role-badge admin' : 'role-badge user';
  }

  getStatusBadgeClass(active: boolean): string {
    return active ? 'status-badge active' : 'status-badge inactive';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
