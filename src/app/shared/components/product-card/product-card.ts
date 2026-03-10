import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BranchesStore } from '../../../stores/branches.store';
import { MatDialog } from '@angular/material/dialog';
import { BranchesDialogComponent } from '../direccion/branches-dialog/branches-dialog.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input({ required: true }) product: any;

  private store = inject(BranchesStore);
  private dialog = inject(MatDialog);

  selectedSucursal = this.store.selectedSucursal;

  get ofertaDiaLabel(): string | null {
    if (!this.product?.ofertaDelDia || !this.product?.diaEnCurso) return null;
    const dayMap: Record<string, string> = {
      Monday: 'Lunes de perfiles',
      Tuesday: 'Martes de perfiles',
      Wednesday: 'Miércoles de perfiles',
      Thursday: 'Jueves de corazón',
      Friday: 'Viernes de perfiles',
      Saturday: 'Sábado de perfiles',
      Sunday: 'Domingo de perfiles',
    };
    return dayMap[this.product.diaEnCurso] ?? null;
  }

  get iconSrc(): string {
    const name = (this.product?.familiaWeb || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[''`]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    return 'img/iconos/' + name + '.svg';
  }

  abrirSelectorSucursal(): void {
    this.dialog.open(BranchesDialogComponent, {
      width: '420px',
      height: '80vh',
      disableClose: true,
      panelClass: 'custom-dialog',
    });
  }
}
