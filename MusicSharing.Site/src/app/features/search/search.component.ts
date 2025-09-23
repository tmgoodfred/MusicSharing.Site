import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PlayerService } from '../../core/services/player.service';
import { CommonModule } from '@angular/common';
import { Song, Rating, User } from '../../core/models/models';
import { SearchService } from '../../core/services/search.service';
import { SongService } from '../../core/services/song.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  songs: Song[] = [];
  users: User[] = [];
  isLoading = false;
  selectedSort = 'relevance';
  error = '';

  // Track artwork load failures per song id
  artworkError = new Set<number>();

  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'titleDesc', label: 'Title (Z-A)' },
    { value: 'artist', label: 'Artist (A-Z)' },
    { value: 'artistDesc', label: 'Artist (Z-A)' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'mostPlayed', label: 'Most Played' },
    { value: 'mostDownloaded', label: 'Most Downloaded' }
  ];

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private songService: SongService,
    private imageService: ImageService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      q: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const q = (params['q'] ?? params['term'] ?? '').toString();
      if (q) {
        this.searchForm.patchValue({ q }, { emitEvent: false });
        this.search();
      }
    });

    this.searchForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => prev.q === curr.q)
    ).subscribe(() => {
      this.updateQueryParams();
      this.search();
    });
  }

  artworkUrl(songId: number): string {
    return this.songService.getArtworkUrl(songId);
  }

  calculateAverageRating(ratings: Rating[] | undefined): string {
    if (!ratings || ratings.length === 0) {
      return 'No ratings';
    }
    const sum = ratings.reduce((acc, rating) => acc + rating.ratingValue, 0);
    const average = sum / ratings.length;
    return average.toFixed(1);
  }

  search(): void {
    const q: string = (this.searchForm.value.q || '').trim();
    if (!q) {
      this.songs = [];
      this.users = [];
      this.error = '';
      this.isLoading = false;
      this.artworkError.clear();
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.artworkError.clear();

    this.searchService.search(q).subscribe({
      next: ({ songs, users }) => {
        this.songs = songs;

        // Deduplicate users by id, merging API users and uploaders
        const embeddedUsers = this.songs.map(s => s.user).filter((u): u is User => !!u);
        this.users = this.uniqueUsers([...(users ?? []), ...embeddedUsers]);

        this.sortResults();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error searching. Please try again.';
        this.isLoading = false;
        console.error('Search error:', err);
      }
    });
  }

  private uniqueUsers(users: User[]): User[] {
    const map = new Map<number, User>();
    for (const u of users) {
      if (u && typeof u.id === 'number' && !map.has(u.id)) {
        map.set(u.id, u);
      }
    }
    return Array.from(map.values());
  }

  clearSearch(): void {
    this.searchForm.reset({ q: '' });
    this.songs = [];
    this.users = [];
    this.artworkError.clear();
    this.updateQueryParams();
  }

  updateQueryParams(): void {
    const q: string = (this.searchForm.value.q || '').trim();
    const queryParams: any = {};
    if (q) queryParams.q = q;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  playSong(song: Song): void {
    this.playerService.play(song);
  }

  addToQueue(song: Song, event: Event): void {
    event.stopPropagation();
    this.playerService.addToQueue(song);
  }

  onSortChange(event: Event): void {
    this.selectedSort = (event.target as HTMLSelectElement).value;
    this.sortResults();
  }

  private sortResults(): void {
    switch (this.selectedSort) {
      case 'title':
        this.songs.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'titleDesc':
        this.songs.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist':
        this.songs.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'artistDesc':
        this.songs.sort((a, b) => b.artist.localeCompare(a.artist));
        break;
      case 'newest':
        this.songs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
      case 'oldest':
        this.songs.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
        break;
      case 'mostPlayed':
        this.songs.sort((a, b) => b.playCount - a.playCount);
        break;
      case 'mostDownloaded':
        this.songs.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getUserInitial(username?: string): string {
    return username ? username.charAt(0).toUpperCase() : '?';
  }

  onArtworkError(id: number): void {
    this.artworkError.add(id);
  }
}
