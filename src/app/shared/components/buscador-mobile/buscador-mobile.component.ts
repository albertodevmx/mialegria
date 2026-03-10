import { Component, EventEmitter, Output, inject, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, Subscription, switchMap, debounceTime, of, catchError } from 'rxjs';
import { BranchesService } from '../../../services/branches.service';

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
  items: Array<{ idRow: number; idProducto: number; producto: string }> = [];
  showAutocomplete = false;
  hasSearched = false;

  ngOnInit(): void {
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      switchMap(q => {
        if (!q) {
          this.items = [];
          this.showAutocomplete = false;
          this.hasSearched = false;
          return of(null);
        }
        return this.branchesService.getServicesInSearcher(q, 1).pipe(
          catchError(() => of({ status: '404', data: [] }))
        );
      })
    ).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.hasSearched = true;
        if (String(res?.status) === '200' && Array.isArray(res?.data)) {
          this.items = res.data;
        } else {
          this.items = [];
        }
        this.showAutocomplete = true;
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
    this.items = [];
    this.showAutocomplete = false;
    this.searchInput.nativeElement.value = '';
    this.animateClose(() => this.closed.emit());
  }

  goBack(): void {
    this.query = '';
    this.items = [];
    this.showAutocomplete = false;
    this.animateClose(() => this.back.emit());
  }

  selectItem(item: any): void {
    console.log('Estudio seleccionado:', item);
    this.showAutocomplete = false;
    this.animateClose(() => this.closed.emit());
  }

  private animateClose(callback: () => void): void {
    this.isClosing = true;
    setTimeout(() => callback(), 300);
  }
}
