import { Component, HostListener } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DialogService } from '../../../shared/services/dialog-service';
import { ErrorHandlerService } from '../../../shared/services/error-handler-service';
import { MediaService } from '../../../shared/services/media-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { UtilityService } from '../../../shared/services/utility-service';
import { VideoService } from '../../../shared/services/video-service';
import { WatchlistService } from '../../../shared/services/watchlist-service';

@Component({
  selector: 'app-my-favorites',
  standalone: false,
  templateUrl: './my-favorites.html',
  styleUrl: './my-favorites.css',
})
export class MyFavorites {
  allVideos: any = [];
  filteredVideos: any = [];
  loading = true;
  loadingMore = false;
  error = false;
  searchQuery: string = '';

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasMoreVideos = true;

  private searchSubject = new Subject<string>();

  constructor(
    private videoService: VideoService,
    private watchListService: WatchlistService,
    private notificationService: NotificationService,
    public utilityService: UtilityService,
    public mediaService: MediaService,
    private dialogService: DialogService,
    private errorHandlerService: ErrorHandlerService,
  ) {}

  ngOnInit(): void {
    this.loadVideos();
    this.initializeSearchDebounce();
  }

  ngDestroy(): void {
    this.searchSubject.complete();
  }

  //initialize debaunce
  initializeSearchDebounce() {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.performSearch();
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && this.hasMoreVideos) {
      this.loadMoreVideos();
    }
  }

  //for loading videos
  loadVideos(page: number = 0) {
    this.error = false;
    this.currentPage = 0;
    this.allVideos = [];
    this.filteredVideos = [];
    const search = this.searchQuery.trim() || undefined;
    this.loading = true;

    this.watchListService.getWatchList(page, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.allVideos = response.content;
        this.filteredVideos = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.hasMoreVideos = response.number < this.totalPages - 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading videos:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  //to loadmore videos
  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.watchListService.getWatchList(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.allVideos = [...this.allVideos, ...response.content];
        this.filteredVideos = [...this.filteredVideos, ...response.content];
        this.currentPage = response.number;
        this.hasMoreVideos = response.number < response.totalPages - 1;
        this.loadingMore = false;
      },
      error: (err) => {
        this.loadingMore = false;
        this.notificationService.error('Failed to load more videos. Please try again later.');
      },
    });
  }

  //for search videos
  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  //for clear search
  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadVideos();
  }

  private performSearch() {
    this.currentPage = 0;
    this.loadVideos();
  }

  toggleWatchList(video: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const videoId = video.id!;
    this.watchListService.removeFromWatchList(videoId).subscribe({
      next: () => {
        this.allVideos = this.allVideos.filter((v: any) => v.id !== videoId);
        this.filteredVideos = this.filteredVideos.filter((v: any) => v.id !== videoId);
        this.notificationService.success('Removed from watchlist');
      },
      error: (err) => {
        this.errorHandlerService.handle(
          err,
          'Failed to remove video from watchlist. Please try again later',
        );
      },
    });
  }

  //to get poster url
  getPosterUrl(video: any) {
    return (
      this.mediaService.getMediaUrl(video, 'image', {
        useCache: true,
      }) || ''
    );
  }

  // to play video
  playVideo(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  formatDuration(seconds: number | undefined): string {
    return this.utilityService.formatDuration(seconds);
  }
}
