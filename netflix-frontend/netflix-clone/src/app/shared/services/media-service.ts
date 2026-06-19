import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth-service';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private apiUrl = environment.apiUrl + '/files';
  private imageCache = new Map<string, string>();

  constructor(
    private authService: AuthService,
    private http: HttpClient,
  ) {}

  uploadFile(file: File): Observable<{ progress: number; url?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const isVideo = file.type.startsWith('video/');
    const uploadUrl = isVideo ? `${this.apiUrl}/upload/video` : `${this.apiUrl}/upload/image`;

    const req = new HttpRequest('POST', uploadUrl, formData, {
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      map((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * event.loaded) / (event.total || 1));
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          const body = event.body as any;
          return { progress: 100, url: body?.url || '' };
        }
        return { progress: 0 };
      }),
    );
  }

  // getMediaUrl(
  //   mediaValue: any,
  //   type: 'image' | 'video',
  //   options?: { useCache?: boolean },
  // ): string | null {
  //   let value = mediaValue;

  //   // Handle image object with poster property
  //   if (type === 'image' && mediaValue && typeof mediaValue === 'object' && mediaValue.poster) {
  //     value = mediaValue.poster;
  //   }

  //   if (!value) {
  //     return null;
  //   }

  //   let uuid = value;

  //   // If value is already a URL, extract UUID
  //   if (typeof value === 'string') {
  //     // Return blob/data URLs directly
  //     if (value.startsWith('blob:') || value.startsWith('data:')) {
  //       return value;
  //     }

  //     // Extract UUID from URL
  //     if (value.includes('/')) {
  //       uuid = value.substring(value.lastIndexOf('/') + 1).split('?')[0];
  //     }
  //   }

  //   // Check image cache
  //   if (options?.useCache && type === 'image' && this.imageCache.has(uuid)) {
  //     return this.imageCache.get(uuid)!;
  //   }

  //   const token = this.authService.getToken();

  //   if (!token) {
  //     return null;
  //   }

  //   const authenticatedUrl = `${this.apiUrl}/${type}/${uuid}?token=${encodeURIComponent(token)}`;

  //   // Cache image URLs if requested
  //   if (options?.useCache && type === 'image') {
  //     this.imageCache.set(uuid, authenticatedUrl);
  //   }

  //   console.log('Original Value:', value);
  //   console.log('UUID:', uuid);
  //   console.log('Generated URL:', authenticatedUrl);

  //   return authenticatedUrl;
  // }

  getMediaUrl(
    mediaValue: any,
    type: 'image' | 'video',
    options?: { useCache?: boolean },
  ): string | null {
    if (!mediaValue) {
      return null;
    }

    let value = mediaValue;

    if (type === 'image' && typeof mediaValue === 'object' && mediaValue.poster) {
      value = mediaValue.poster;
    }

    if (typeof value === 'string') {
      if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('blob:') ||
        value.startsWith('data:')
      ) {
        return value;
      }
    }

    return value;
  }
}
