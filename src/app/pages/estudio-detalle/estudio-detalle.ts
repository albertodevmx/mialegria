import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BranchesService } from '../../services/branches.service';
import { BranchesStore } from '../../stores/branches.store';
import { BranchesDialogComponent } from '../../shared/components/direccion/branches-dialog/branches-dialog.component';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-estudio-detalle',
  standalone: true,
  imports: [CommonModule, MatIconModule, ProductCard],
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
  suggestedBranches = signal<any[]>([]);
  recommendedProducts = signal<any[]>([]);
  private isMobile = signal(window.innerWidth < 768);

  displayedRecommended = computed(() => {
    const all = this.recommendedProducts();
    return this.isMobile() ? all.slice(0, 2) : all.slice(0, 4);
  });

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

  get estudiosIncluidosList(): string[] {
    const raw = this.producto()?.estudiosIncluidos;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.split(/[,\r\n]+/).map((s: string) => s.trim()).filter(Boolean);
  }

  get categoryName(): string {
    return this.producto()?.familiaWeb || this.producto()?.subFamiliaWeb || '';
  }

  get ofertaDiaLabel(): string | null {
    if (!this.producto()?.ofertaDelDia) return null;
    const dayMap: Record<string, string> = {
      Monday: 'Lunes de perfiles',
      Tuesday: 'Martes de perfiles',
      Wednesday: 'Miércoles de perfiles',
      Thursday: 'Jueves de corazón',
      Friday: 'Viernes de perfiles',
      Saturday: 'Sábado de perfiles',
      Sunday: 'Domingo de perfiles',
    };
    const dayEn = this.producto()?.diaEnCurso
      || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    return dayMap[dayEn] ?? null;
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

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  private loadDetail(idProduct: number): void {
    this.loading.set(true);
    this.suggestedBranches.set([]);
    const sucursal = this.selectedSucursal();
    const idSucursal = sucursal?.idSucursal ?? sucursal?.id;
    this.service.getProductDetail(idProduct, idSucursal ?? undefined).subscribe({
      next: (res) => {
        if (res?.data?.length) {
          const prod = res.data[0];
          this.producto.set(prod);
          // Si hay sucursal seleccionada y el estudio no tiene precio, cargar sucursales sugeridas
          if (idSucursal && !prod.precioVenta) {
            this.loadSuggestedBranches(idSucursal, prod.idProducto);
          }
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    // Cargar recomendados
    this.loadRecommended();
  }

  private loadRecommended(): void {
    this.service.getTopProducts(4).subscribe({
      next: (res: any) => {
        if (res?.status === '200' && Array.isArray(res?.data)) {
          this.recommendedProducts.set(res.data);
        }
      },
    });
  }

  private loadSuggestedBranches(idSucursal: number, idProducto: number): void {
    this.service.getAssociatedBranches(idSucursal, idProducto).subscribe({
      next: (res) => {
        if (res?.status === '200' && Array.isArray(res?.data)) {
          this.suggestedBranches.set(res.data);
        }
      },
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
