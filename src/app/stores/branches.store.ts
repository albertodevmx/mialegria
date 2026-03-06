import { Injectable, signal } from '@angular/core';
import { StateItem } from './../interfaces/state-item-interface';
import { BranchItem } from './../interfaces/branch-item.interface';

@Injectable({ providedIn: 'root' })
export class BranchesStore {

  // Signals
  searchText = signal<string>('');
  states = signal<StateItem[]>([]);
  recentBranches = signal<BranchItem[]>([]);
  topBranches = signal<any[]>([]);
  sucursalesCargadas = signal<any[] | null>(null);
  selectedState = signal<StateItem | null>(null);
  // Signals NUEVAS
  webFamiliesAll = signal<Array<{ idFamiliaWeb: number; familiaWeb: string; idSubFamiliaWeb: number; subFamiliaWeb: string }>>([]);
  webFamilies = signal<Array<{ idFamiliaWeb: number; familiaWeb: string }>>([]);
  topProducts = signal<any[]>([]);
  isSidebarOpen = signal<boolean>(false);
  // UI alerts
  hasInvalidChars = signal<boolean>(false);
  noResults = signal<boolean>(false);



  // Setters
  setSearchText(v: string) { this.searchText.set(v); }
  setStates(v: StateItem[]) { this.states.set(v); }
  setRecentBranches(v: BranchItem[]) { this.recentBranches.set(v); }
  setTopBranches(v: any[]) { this.topBranches.set(v); }
  setSucursales(v: any[] | null) { this.sucursalesCargadas.set(v); }
  setSelectedState(v: StateItem | null) { this.selectedState.set(v); }
  // Setters NUEVOS
  setWebFamiliesAll(v: Array<{ idFamiliaWeb: number; familiaWeb: string; idSubFamiliaWeb: number; subFamiliaWeb: string }>) { this.webFamiliesAll.set(v); }
  setWebFamilies(v: Array<{ idFamiliaWeb: number; familiaWeb: string }>) { this.webFamilies.set(v); }
  setTopProducts(v: any[]) { this.topProducts.set(v); }
  // helpers
  openSidebar() { this.isSidebarOpen.set(true); }
  closeSidebar() { this.isSidebarOpen.set(false); }
  toggleSidebar() { this.isSidebarOpen.update(v => !v); }
  // alertas buscador ventana modal inicio
  setHasInvalidChars(v: boolean) { this.hasInvalidChars.set(v); }
  setNoResults(v: boolean) { this.noResults.set(v); }




  // NUEVO: gestión de acordeón (conjunto de índices abiertos)
  private _expandedMunicipios = signal<Set<number>>(new Set());

  // NUEVO: selección de sucursal y municipio
  selectedSucursal = signal<any | null>(null);        // guardamos OBJETO completo (recomendado)
  lastClickedMunicipio = signal<any | null>(null);    // municipio (objeto t)

  // --- Métodos de acordeón ---
  isMunicipioExpanded(index: number): boolean {
    return this._expandedMunicipios().has(index);
  }

  toggleMunicipio(index: number): void {
    this._expandedMunicipios.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  // --- Selección ---
  setSelectedSucursal(sucursal: any, municipio: any): void {
    this.selectedSucursal.set(sucursal);        // OBJETO completo de la sucursal seleccionada
    this.lastClickedMunicipio.set(municipio);   // OBJETO completo del municipio
  }

  // Si quieres limpiar selección:
  clearSelection(): void {
    this.selectedSucursal.set(null);
    this.lastClickedMunicipio.set(null);
  }



  resetUi(): void {
    this.setHasInvalidChars(false);
    this.setNoResults(false);
    // this.setSearchText('');
    // this.setStates([]);
    // this.setSucursales(null);
    // this.setRecentBranches([]);
  }


}