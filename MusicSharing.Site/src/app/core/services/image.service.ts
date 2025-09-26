import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private imageCache = new Map<string, string>();
  private apiBaseUrl = 'https://music-sharing.online/api';

  getProfileImageUrl(userId: number, forceRefresh = false): string {
    const baseUrl = `${this.apiBaseUrl}/user/${userId}/profile-picture`;
    const cacheKey = `profile_${userId}`;

    if (forceRefresh || !this.imageCache.has(cacheKey)) {
      const url = `${baseUrl}?t=${new Date().getTime()}`;
      this.imageCache.set(cacheKey, url);
      return url;
    }

    return this.imageCache.get(cacheKey)!;
  }

  getSongArtworkUrl(songId: number, forceRefresh = false): string {
    const baseUrl = `${this.apiBaseUrl}/music/${songId}/artwork`;
    const cacheKey = `artwork_${songId}`;

    if (forceRefresh || !this.imageCache.has(cacheKey)) {
      const url = `${baseUrl}?t=${new Date().getTime()}`;
      this.imageCache.set(cacheKey, url);
      return url;
    }

    return this.imageCache.get(cacheKey)!;
  }

  clearImageCache(type?: 'profile' | 'artwork', id?: number): void {
    if (type && id) {
      if (type === 'profile') {
        this.imageCache.delete(`profile_${id}`);
      } else if (type === 'artwork') {
        this.imageCache.delete(`artwork_${id}`);
      }
    } else {
      this.imageCache.clear();
    }
  }
}
