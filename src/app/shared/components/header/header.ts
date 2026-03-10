import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DireccionComponent } from '../direccion/direccion.component';
import { BuscadorComponent } from '../buscador/buscador.component';
import { BuscadorMobileComponent } from '../buscador-mobile/buscador-mobile.component';
import { NavBar } from './../nav-bar/nav-bar';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

// ✅ Store (signals)
import { BranchesStore } from '../../../stores/branches.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    DireccionComponent,
    BuscadorComponent,
    BuscadorMobileComponent,
    NavBar,

    MatIconModule,
    MatButtonModule,
    MatBadgeModule,

    // ❌ MatSidenavModule ya no va aquí (vive en el Layout)
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit {
  private store = inject(BranchesStore);

  cartCount = 0;
  showMobileSearch = false;

  onCartClick() {
    throw new Error('Method not implemented.');
  }

  onSearchClick(): void {
    this.showMobileSearch = true;
  }

  closeMobileSearch(): void {
    this.showMobileSearch = false;
  }

  onLoginClick() {
    throw new Error('Method not implemented.');
  }

  // ✅ Nuevo: hamburguesa -> signal
  toggleSidebar(): void {
    this.store.toggleSidebar();
  }

  /** Puede ser string (simple) o un objeto si guardas JSON en sessionStorage */
  ubicacion: unknown = null;

  constructor() {}

  ngOnInit(): void {
    this.cargarUbicacion();
  }

  /** Lee sessionStorage["similab_ubicacion"]. Si es JSON válido, lo parsea; de lo contrario, lo deja como string. */
  private cargarUbicacion(): void {
    const raw = sessionStorage.getItem('similab_ubicacion');

    if (!raw) {
      this.ubicacion = null;
      return;
    }

    try {
      this.ubicacion = JSON.parse(raw);
    } catch {
      this.ubicacion = raw;
    }
  }

  /** True si existe una ubicación en sessionStorage */
  get tieneUbicacion(): boolean {
    return !!this.ubicacion;
  }

  /** Mapea una etiqueta amigable para mostrar */
  get etiquetaUbicacion(): string {
    const u = this.ubicacion as any;
    return (
      u?.nombre ??
      u?.label ??
      u?.direccion ??
      (typeof u === 'string' ? u : 'Ubicación seleccionada')
    );
  }
}