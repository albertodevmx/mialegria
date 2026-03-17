import { Component, EventEmitter, Output, inject, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, Subscription, switchMap, debounceTime, of, catchError } from 'rxjs';
import { BranchesService } from '../../../services/branches.service';

type SearchItem = { idRow: number; idProducto: number; producto: string };

@Component({
  selector: 'app-buscador-mobile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './buscador-mobile.component.html',
  styleUrl: './buscador-mobile.component.scss'
})
export class BuscadorMobileComponent implements AfterViewInit, OnInit, OnDestroy {
  @Output() closed = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private branchesService = inject(BranchesService);
  private search$ = new Subject<string>();
  private searchSub!: Subscription;

  isClosing = false;
  query = '';
  items = signal<SearchItem[]>([]);
  hasSearched = signal(false);

  ngOnInit(): void {
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      switchMap(q => {
        if (!q) {
          this.items.set([]);
          this.hasSearched.set(false);
          return of(null);
        }
        return this.branchesService.getServicesInSearcher(q, 0).pipe(
          catchError(() => of({ status: '404', data: [] }))
        );
      })
    ).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.hasSearched.set(true);
        if (String(res?.status) === '200' && Array.isArray(res?.data)) {
          this.items.set(res.data);
        } else {
          this.items.set([]);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInput?.nativeElement.focus(), 300);
  }

  onSearch(value: string): void {
    this.query = value;
    this.search$.next(value.trim());
  }

  clearInput(): void {
    this.query = '';
    this.items.set([]);
    this.hasSearched.set(false);
    this.searchInput.nativeElement.value = '';
    this.animateClose(() => this.closed.emit());
  }

  goBack(): void {
    this.query = '';
    this.items.set([]);
    this.hasSearched.set(false);
    this.animateClose(() => this.back.emit());
  }

  selectItem(item: SearchItem): void {
    console.log('Estudio seleccionado:', item);
    this.items.set([]);
    this.hasSearched.set(false);
    this.animateClose(() => this.closed.emit());
  }

  private animateClose(callback: () => void): void {
    this.isClosing = true;
    setTimeout(() => callback(), 300);
  }
}
