import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  @Input() viewMode: 'tarjetas' | 'listado' = 'tarjetas';

  private store = inject(BranchesStore);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  selectedSucursal = this.store.selectedSucursal;

  get ofertaDiaLabel(): string | null {
    if (!this.product?.ofertaDelDia || !this.product?.diaEnCurso) return null;
    return this.getDayLabel(this.product.diaEnCurso);
  }

  get precioEspecialLabel(): string | null {
    if (!this.product?.ofertaDelDia) return null;
    const dayEn = this.product?.diaEnCurso
      || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    return this.getDayLabel(dayEn);
  }

  private getDayLabel(dayEn: string): string | null {
    const dayMap: Record<string, string> = {
      Monday: 'Lunes de perfiles',
      Tuesday: 'Martes de perfiles',
      Wednesday: 'Miércoles de perfiles',
      Thursday: 'Jueves de corazón',
      Friday: 'Viernes de perfiles',
      Saturday: 'Sábado de perfiles',
      Sunday: 'Domingo de perfiles',
    };
    return dayMap[dayEn] ?? null;
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

  verDetalle(): void {
    this.router.navigate(['/estudio-detalle', this.product.idProducto]);
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
