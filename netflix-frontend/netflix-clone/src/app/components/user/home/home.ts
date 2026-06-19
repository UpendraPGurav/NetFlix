import { Component, HostListener, OnInit } from '@angular/core';
import { debounce, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { VideoService } from '../../../shared/services/video-service';
import { WatchlistService } from '../../../shared/services/watchlist-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { UtilityService } from '../../../shared/services/utility-service';
import { DialogService } from '../../../shared/services/dialog-service';
import { MediaService } from '../../../shared/services/media-service';
import { ErrorHandlerService } from '../../../shared/services/error-handler-service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  allVideos: any = [];
  filteredVideos: any = [];
  loading = true;
  loadingMore = false;
  error = false;
  searchQuery: string = '';

  featuredVideos: any = [];
  currentSlideIndex = 0;
  featuredLoading = true;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasMoreVideos = true;

  private searchSubject = new Subject<string>();
  private sliderInterval: any;
  private savedScrollPosition: number = 0;

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
    this.loadFeaturedVideos();
    this.loadVideos();
    this.initializeSearchDebounce();
  }

  ngDestroy(): void {
    this.searchSubject.complete();
    this.stopSlider();
  }

  //initialize debaunce
  initializeSearchDebounce() {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.performSearch();
    });
  }

  //load featured videos
  loadFeaturedVideos() {
    this.featuredLoading = true;
    this.videoService.getFeaturedVideos().subscribe({
      next: (videos:any) => {
        this.featuredVideos = videos;     
        this.featuredLoading = false;
        if (this.featuredVideos.length > 1) {
          this.startSlider();
        }
      },
      error: (err: any) => {
        this.featuredLoading = false;
        this.errorHandlerService.handle(err, 'Failed to load featured videos');
      },
    });
  }

  // start slider
  private startSlider() {
    this.sliderInterval = setInterval(() => {
      this.nextSlider();
    }, 5000);
  }

  //stop slider
  private stopSlider() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  // for next slide
  nextSlider() {
    if (this.featuredVideos.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.featuredVideos.length;
    }
  }

  // previous slider
  previousSlider() {
    if (this.featuredVideos.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex - 1 + this.featuredVideos.length) % this.featuredVideos.length;
    }
  }

  //go to index
  goToSlide(index: number) {
    this.currentSlideIndex = index;
    this.stopSlider();
    if (this.featuredVideos.length > 1) {
      this.startSlider();
    }
  }

  // to get current feature
  getCurrentFeature() {
    return this.featuredVideos[this.currentSlideIndex] || null;
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
    const isSearching = !!search;
    this.loading = true;

    this.videoService.getPublishedVideosPaginated(page, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.allVideos = response.content;
        this.filteredVideos = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.hasMoreVideos = response.number < this.totalPages - 1;
        this.loading = false;

        if (isSearching && this.savedScrollPosition > 0) {
          setTimeout(() => {
            window.scrollTo({ top: this.savedScrollPosition, behavior: 'auto' });
            this.savedScrollPosition = 0;
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error loading videos:', err);
        this.error = true;
        this.loading = false;
        this.savedScrollPosition = 0;
      },
    });
  }

  //to loadmore videos
  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.videoService.getPublishedVideosPaginated(nextPage, this.pageSize, search).subscribe({
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
    this.savedScrollPosition = 0;
    this.loadVideos();
  }

  private performSearch() {
    this.savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.currentPage = 0;
    this.loadVideos();
  }

  //is in watchlist
  isInWatchList(video: any): boolean {
    return video.isInWatchList === true;
  }

  // for toggling watchlist
  toggleWatchList(video: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const videoId = video.id!;
    const isInList = this.isInWatchList(video);

    if (isInList) {
      video.isInWatchList = true;
      this.watchListService.removeFromWatchList(videoId).subscribe({
        next: () => {
          this.notificationService.success('Removed from watchlist');
        },
        error: (err) => {
          video.isInWatchList = true;
          this.errorHandlerService.handle(
            err,
            'Failed to remove video from watchlist. Please try again later',
          );
        },
      });
    } else {
      video.isInWatchList = true;
      this.watchListService.addToWatchList(videoId).subscribe({
        next: () => {
          this.notificationService.success('Added to watchlist');
        },
        error: (err) => {
          video.isInWatchList = false;
          this.errorHandlerService.handle(
            err,
            'Failed to add video to watchlist. Please try again later',
          );
        },
      });
    }
  }

  //to get poster url
  getPosterUrl(video: any) {    
    // return (
    //   this.mediaService.getMediaUrl(video, 'image', {
    //     useCache: true,
    //   }) || ''
    // );
    return video?.poster;
  }

  // to play video
  playVideo(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  formatDuration(seconds: number | undefined): string {
    return this.utilityService.formatDuration(seconds);
  }
}
