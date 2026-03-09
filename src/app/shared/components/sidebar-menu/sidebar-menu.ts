import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BranchesStore } from '../../../stores/branches.store';
import { BranchesService } from '../../../services/branches.service';

interface FamiliaGroup {
  idFamiliaWeb: number;
  familiaWeb: string;
  subFamilias: { idSubFamiliaWeb: number; subFamiliaWeb: string }[];
}

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.scss',
})
export class SidebarMenu {
  private branchesService = inject(BranchesService);
  private router = inject(Router);
  store = inject(BranchesStore);

  estudiosOpen = signal(false);

  familiasGrouped = computed<FamiliaGroup[]>(() => {
    const all = this.store.webFamiliesAll();
    const map = new Map<number, FamiliaGroup>();

    for (const item of all) {
      if (!map.has(item.idFamiliaWeb)) {
        map.set(item.idFamiliaWeb, {
          idFamiliaWeb: item.idFamiliaWeb,
          familiaWeb: item.familiaWeb,
          subFamilias: [],
        });
      }
      map.get(item.idFamiliaWeb)!.subFamilias.push({
        idSubFamiliaWeb: item.idSubFamiliaWeb,
        subFamiliaWeb: item.subFamiliaWeb,
      });
    }

    return Array.from(map.values());
  });

  toggleEstudios(): void {
    const willOpen = !this.estudiosOpen();
    this.estudiosOpen.set(willOpen);

    // Si aún no hay data cargada, la pedimos al servicio
    if (willOpen && this.store.webFamiliesAll().length === 0) {
      this.branchesService.getAllWebFamily().subscribe({
        next: (res: any) => {
          const statusOk = String(res?.status) === '200';
          if (statusOk && Array.isArray(res?.data)) {
            this.store.setWebFamiliesAll(res.data);
          }
        },
      });
    }
  }

  resetState(): void {
    this.estudiosOpen.set(false);
  }

  closeSidebar(): void {
    this.resetState();
    this.store.closeSidebar();
  }

  onSubFamiliaClick(subFamilia: { idSubFamiliaWeb: number; subFamiliaWeb: string }, familia: FamiliaGroup): void {
    console.log('SubFamilia clickeada:', subFamilia, 'de familia:', familia.familiaWeb);
    this.closeSidebar();
  }

  onFamiliaClick(familia: FamiliaGroup): void {
    this.closeSidebar();
    this.router.navigate(['/categorias'], {
      queryParams: { idFamilia: familia.idFamiliaWeb },
    });
  }

  onMenuItemClick(): void {
    this.closeSidebar();
  }
}
