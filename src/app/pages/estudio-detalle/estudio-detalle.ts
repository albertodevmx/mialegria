import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BranchesService } from '../../services/branches.service';
import { BranchesStore } from '../../stores/branches.store';
import { BranchesDialogComponent } from '../../shared/components/direccion/branches-dialog/branches-dialog.component';

@Component({
  selector: 'app-estudio-detalle',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './estudio-detalle.html',
  styleUrl: './estudio-detalle.scss',
})
export class EstudioDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private service = inject(BranchesService);
  private store = inject(BranchesStore);
  private dialog = inject(MatDialog);

  selectedSucursal = this.store.selectedSucursal;
  lastClickedMunicipio = this.store.lastClickedMunicipio;

  producto = signal<any | null>(null);
  loading = signal(true);

  get iconSrc(): string {
    const name = (this.producto()?.familiaWeb || this.producto()?.subFamiliaWeb || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[''`]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    return 'img/iconos/' + name + '.svg';
  }

  get imageSrc(): string {
    const name = (this.producto()?.familiaWeb || this.producto()?.subFamiliaWeb || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[''`]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    return 'img/estudios/' + name + '.png';
  }

  get categoryName(): string {
    return this.producto()?.familiaWeb || this.producto()?.subFamiliaWeb || '';
  }

  get sucursalDireccion(): string {
    const s = this.selectedSucursal();
    if (!s) return '';
    // Si viene de nerestsBranches (campos desglosados)
    if (s.calle) {
      const parts = [
        [s.calle, s.exterior].filter(Boolean).join(' '),
        s.interior ? 'Int. ' + s.interior : '',
        s.colonia,
        s.ciudad,
        s.cp,
        s.estado,
      ].filter(Boolean);
      return parts.join(', ');
    }
    // Si viene de topBranches (campo unificado)
    return s.direccion || s.address || '';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.loadDetail(id);
    });
  }

  private loadDetail(idProduct: number): void {
    this.loading.set(true);
    const sucursal = this.selectedSucursal();
    const idSucursal = sucursal?.idSucursal ?? sucursal?.id;
    this.service.getProductDetail(idProduct, idSucursal ?? undefined).subscribe({
      next: (res) => {
        if (res?.data?.length) {
          this.producto.set(res.data[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goBack(): void {
    this.location.back();
  }

  abrirSelectorSucursal(): void {
    const ref = this.dialog.open(BranchesDialogComponent, {
      width: '420px',
      height: '80vh',
      disableClose: true,
      panelClass: 'custom-dialog',
    });
    ref.afterClosed().subscribe(() => {
      const p = this.producto();
      if (p) this.loadDetail(p.idProducto);
    });
  }
}
