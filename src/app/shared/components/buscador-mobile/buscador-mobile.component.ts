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

  query = '';
  items: Array<{ idProducto: number; producto: string }> = [];
  showAutocomplete = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInput?.nativeElement.focus(), 100);
  }

  onSearch(value: string): void {
    this.query = value;

    if (!value.trim()) {
      this.items = [];
      this.showAutocomplete = false;
      return;
    }

    this.branchesService.getServicesInSearcher(value.trim()).subscribe({
      next: (res: any) => {
        if (String(res?.status) === '200' && Array.isArray(res?.data)) {
          this.items = res.data.slice(0, 10);
          this.showAutocomplete = true;
        } else {
          this.items = [];
          this.showAutocomplete = false;
        }
      },
      error: () => {
        this.items = [];
        this.showAutocomplete = false;
      }
    });
  }

  clearInput(): void {
    this.query = '';
    this.items = [];
    this.showAutocomplete = false;
    this.searchInput.nativeElement.value = '';
    this.closed.emit();
  }

  goBack(): void {
    this.query = '';
    this.items = [];
    this.showAutocomplete = false;
    this.back.emit();
  }

  selectItem(item: any): void {
    console.log('Estudio seleccionado:', item);
    this.showAutocomplete = false;
    this.closed.emit();
  }
}
