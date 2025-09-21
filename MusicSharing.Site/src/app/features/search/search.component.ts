import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SongService } from '../../core/services/song.service';
import { PlayerService } from '../../core/services/player.service';
import { CommonModule } from '@angular/common';
import { Song, Rating } from '../../core/models/models';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  results: Song[] = [];
  isLoading = false;
  selectedSort = 'relevance';
  error = '';

  // Add the sortOptions array
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
    private songService: SongService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      term: [''],
      artist: [''],
      genre: [''],
      tags: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['term']) {
        this.searchForm.patchValue({
          term: params['term'] || '',
          artist: params['artist'] || '',
          genre: params['genre'] || '',
          tags: params['tags'] || ''
        });

        this.search();
      }
    });

    // Trigger search when form values change (with debounce)
    this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) =>
        prev.term === curr.term &&
        prev.artist === curr.artist &&
        prev.genre === curr.genre &&
        prev.tags === curr.tags
      ),
    ).subscribe(() => {
      this.search();
      this.updateQueryParams();
    });
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
    this.isLoading = true;
    this.error = '';

    const formValues = this.searchForm.value;
    const tags = formValues.tags ? formValues.tags.split(',').map((tag: string) => tag.trim()) : [];

    this.songService.searchSongs(
      formValues.term,
      formValues.artist,
      formValues.genre,
      tags
    ).subscribe({
      next: (results) => {
        this.results = results;
        this.sortResults();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error searching songs. Please try again.';
        this.isLoading = false;
        console.error('Search error:', error);
      }
    });
  }

  clearSearch(): void {
    this.searchForm.reset({
      term: '',
      artist: '',
      genre: '',
      tags: ''
    });
    this.results = [];
  }

  updateQueryParams(): void {
    const queryParams: any = {};
    const formValues = this.searchForm.value;

    if (formValues.term) queryParams.term = formValues.term;
    if (formValues.artist) queryParams.artist = formValues.artist;
    if (formValues.genre) queryParams.genre = formValues.genre;
    if (formValues.tags) queryParams.tags = formValues.tags;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
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
        this.results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'titleDesc':
        this.results.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist':
        this.results.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'artistDesc':
        this.results.sort((a, b) => b.artist.localeCompare(a.artist));
        break;
      case 'newest':
        this.results.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
      case 'oldest':
        this.results.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
        break;
      case 'mostPlayed':
        this.results.sort((a, b) => b.playCount - a.playCount);
        break;
      case 'mostDownloaded':
        this.results.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
