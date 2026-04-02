import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BranchesDialogComponent } from './branches-dialog/branches-dialog.component';
import { BranchesStore } from './../../../stores/branches.store'; // <-- Ajusta la ruta si cambia


@Component({
	selector: 'app-direccion',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatIconModule
	],
	templateUrl: './direccion.component.html',
	styleUrls: ['./direccion.component.scss'],
})
export class DireccionComponent implements OnInit {
	private dialog = inject(MatDialog);
	private router = inject(Router);
	public store = inject(BranchesStore);

	ngOnInit(): void {
		const isHome = this.router.url === '/' || this.router.url.startsWith('/?');
		if (isHome && !this.dialog.openDialogs.length) {
			this.abrirSelector();
		}
	}

	// === Getters para la plantilla ===
	// Regresan el valor de los signals (los signals son funciones; aquí los invocamos)
	get selectedSucursal() {
		return this.store.selectedSucursal();
	}

	get lastClickedMunicipio() {
		return this.store.lastClickedMunicipio();
	}

	// (Opcional) por si quieres mostrar la lista cargada en esta vista
	get sucursalesCargadas() {
		return this.store.sucursalesCargadas();
	}

	// (Opcional) helpers de UI
	get tieneSucursalSeleccionada(): boolean {
		return !!this.store.selectedSucursal();
	}

	get etiquetaSeleccion(): string {
		const suc = this.store.selectedSucursal() as any;
		const mun = this.store.lastClickedMunicipio() as any;
		if (suc && mun) {
			// Ajusta los campos según tu API (ej. suc.sucursal, suc.nombre, suc.direccion)
			return `${suc.sucursal ?? suc.name ?? 'Sucursal'} — ${mun.municipio ?? 'Municipio'}`;
		}
		return 'Selecciona una sucursal';
	}

	abrirSelector(): void {
		const ref = this.dialog.open(BranchesDialogComponent, {
			width: '420px',
			height: '80vh',
			disableClose: true,
			panelClass: 'custom-dialog',
		});

		// Si necesitas reaccionar tras cerrar, por ejemplo navegar con la sucursal seleccionada:
		ref.afterClosed().subscribe(() => {
			const suc = this.store.selectedSucursal();

			this.store.resetUi();
			if (suc) {
				// Aquí podrías:
				// - Guardar en sessionStorage
				// - Navegar a otra ruta
				// - Cerrar otro diálogo, etc.
				// sessionStorage.setItem('similab_ubicacion', JSON.stringify(suc));
			}
		});
	}
}
``