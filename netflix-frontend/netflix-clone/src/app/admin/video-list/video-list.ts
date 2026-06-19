import { Component, HostListener } from '@angular/core';
import { DialogService } from '../../shared/services/dialog-service';
import { MatTableDataSource } from '@angular/material/table';
import { UtilityService } from '../../shared/services/utility-service';
import { VideoService } from '../../shared/services/video-service';
import { NotificationService } from '../../shared/services/notification-service';
import { MediaService } from '../../shared/services/media-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';

@Component({
  selector: 'app-video-list',
  standalone: false,
  templateUrl: './video-list.html',
  styleUrl: './video-list.css',
})
export class VideoList {
  pageVideos: any = [];
  loading = false;
  loadingMore = false;
  searchQuery = '';

  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  hasMoreVideos = true;

  totalVideos = 0;
  publishedVideos = 0;
  totalDurationSeconds = 0;

  // data = new MatTableDataSource<any>([]);

  constructor(
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private videoService: VideoService,
    public utilityService: UtilityService,
    private mediaService: MediaService,
    private errorService: ErrorHandlerService,
  ) {}

  ngOnInit() {
    this.load();
    this.loadStats();
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && this.hasMoreVideos) {
      this.loadMoreVideos();
    }
  }
  
  load() {
  this.loading = true;

  this.videoService.getAllAdminVideos(
    this.currentPage,
    this.pageSize,
    this.searchQuery.trim() || undefined
  ).subscribe({
    next: (response: any) => {
      this.pageVideos = response.content;

      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;
      this.currentPage = response.number;
      this.hasMoreVideos = this.currentPage < this.totalPages - 1;

      this.loading = false;

      setTimeout(() => {
        this.checkAndLoadMore();
      });
    }
  });
}

checkAndLoadMore() {
  const pageHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;

  if (
    pageHeight <= viewportHeight &&
    this.hasMoreVideos &&
    !this.loadingMore
  ) {
    this.loadMoreVideos();
  }
}

  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.videoService.getAllAdminVideos(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.pageVideos = [...this.pageVideos, ...response.content];
        this.currentPage = response.number;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        this.loadingMore = false;
      },
      error: (err) => {
        this.loadingMore = false;
        this.errorService.handle(err, 'Failed to load more videos');
      },
    });
  }
  loadStats() {
    this.videoService.getStatsByAdmin().subscribe((stats: any) => {
      this.totalVideos = stats.totalVideos;
      this.publishedVideos = stats.publishedVideos;
      this.totalDurationSeconds = stats.totalDuration;
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.currentPage = 0;
    this.load();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 0;
    this.load();
  }

  playVideo(video: any) {
    this.dialogService.openVideoPlayer(video);
  }
  createNew() {
    const dialogRef = this.dialogService.openVideoFormDialog('create');
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.load();
        this.loadStats();
        this.notificationService.success('Video created successfully');
      }
    });
  }

  editVideo(video: any) {
    const dialogRef = this.dialogService.openVideoFormDialog('edit', video);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.load();
        this.loadStats();
        this.notificationService.success('Video updated successfully');
      }
    });
  }

  deleteVideo(video: any) {
    this.dialogService
      .openConfirmation(
        'Delete Video',
        `Are you sure you want to delete "${video.title}"? This action cannot be undone.`,
        'Delete',
        'Cancel',
        'danger',
      )
      .subscribe((response) => {
        if (response) {
          this.loading = true;
          this.videoService.deleteVideoByAdmin(video.id).subscribe({
            next: () => {
              this.notificationService.success('Video deleted successfully');
              this.load();
              this.loadStats();
            },
            error: (err) => {
              this.loading = false;
              this.errorService.handle(err, 'Failed to delete video,Please try again later');
            },
          });
        }
      });
  }

  togglePublish(event: any, video: any) {
    const newPublishedState = event.checked;

    this.videoService.setPublishedByAdmin(video.id, newPublishedState).subscribe({
      next: () => {
        video.published = newPublishedState;

        this.notificationService.success(
          `Video ${newPublishedState ? 'published' : 'unpublished'} successfully`,
        );

        this.loadStats();
      },
      error: (err) => {
        this.errorService.handle(
          err,
          `Failed to ${newPublishedState ? 'publish' : 'unpublish'} video. Please try again later`,
        );
      },
    });
  }

  getPublishCount(): number {
    return this.publishedVideos;
  }

  getTotalDuration(): string {
    const total = this.totalDurationSeconds;
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatDuration(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
  }

  getPosterUrl(video: any) {
    // return this.mediaService.getMediaUrl(video, 'image', { useCache: true });
    return video?.poster;
  }
}
