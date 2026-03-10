import { Component, EventEmitter, Output, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BranchesService } from '../../../services/branches.service';

@Component({
  selector: 'app-buscador-mobile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './buscador-mobile.component.html',
  styleUrl: './buscador-mobile.component.scss'
})
export class BuscadorMobileComponent implements AfterViewInit {
  @Output() closed = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private branchesService = inject(BranchesService);

  isClosing = false;
  query = '';
  items: Array<{ idRow: number; idProducto: number; producto: string }> = [];
  showAutocomplete = false;
  private isLoading = false;
  private hasMore = true;

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInput?.nativeElement.focus(), 300);
  }

  onSearch(value: string): void {
    this.query = value;

    if (!value.trim()) {
      this.items = [];
      this.showAutocomplete = false;
      this.hasMore = true;
      return;
    }

    this.items = [];
    this.hasMore = true;
    this.fetchResults(value.trim(), 0);
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (nearBottom && !this.isLoading && this.hasMore && this.items.length > 0) {
      const lastIdRow = this.items[this.items.length - 1].idRow;
      this.fetchResults(this.query.trim(), lastIdRow);
    }
  }

  private fetchResults(query: string, skip: number): void {
    this.isLoading = true;
    this.branchesService.getServicesInSearcher(query, skip).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (String(res?.status) === '200' && Array.isArray(res?.data)) {
          if (res.data.length === 0) {
            this.hasMore = false;
          } else {
            this.items = [...this.items, ...res.data];
            this.showAutocomplete = true;
          }
        } else {
          this.hasMore = false;
          if (this.items.length === 0) {
            this.showAutocomplete = false;
          }
        }
      },
      error: () => {
        this.isLoading = false;
        if (this.items.length === 0) {
          this.showAutocomplete = false;
        }
      }
    });
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
