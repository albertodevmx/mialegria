import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BranchesStore } from '../../../stores/branches.store';

interface EstudioItem {
  nombre: string;
  slug: string;
  destacado?: boolean;
}

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.scss',
})
export class SidebarMenu {
  private http = inject(HttpClient);
  store = inject(BranchesStore);

  estudiosOpen = signal(false);
  estudios = signal<EstudioItem[]>([]);
  estudiosLoaded = false;

  toggleEstudios(): void {
    const willOpen = !this.estudiosOpen();
    this.estudiosOpen.set(willOpen);

    if (willOpen && !this.estudiosLoaded) {
      this.http.get<EstudioItem[]>('data/sidebar-estudios.json').subscribe({
        next: (data) => {
          this.estudios.set(data);
          this.estudiosLoaded = true;
        },
      });
    }
  }

  resetState(): void {
    this.estudiosOpen.set(false);
    this.estudios.set([]);
    this.estudiosLoaded = false;
  }

  closeSidebar(): void {
    this.resetState();
    this.store.closeSidebar();
  }

  onEstudioClick(item: EstudioItem): void {
    this.closeSidebar();
  }

  onMenuItemClick(): void {
    this.closeSidebar();
  }
}
