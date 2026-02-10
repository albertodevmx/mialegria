import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BranchesService } from './../../../../services/branches.service';
import { BranchesStore } from '../../../../stores/branches.store';
// <mat-progress-spinner>
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
	selector: 'app-branches-dialog',
	standalone: true,
	templateUrl: './branches-dialog.component.html',
	styleUrls: ['./branches-dialog.component.scss'],
	imports: [
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatCardModule,
		MatAutocompleteModule,
		MatProgressSpinnerModule
	]
})
export class BranchesDialogComponent {
	public store = inject(BranchesStore);
	private dialogRef = inject(MatDialogRef<BranchesDialogComponent>);
	private branchesService = inject(BranchesService);
	displayState = (st?: any) => st?.estado ?? '';
	public displayPreloadTopBranches: boolean = true;

	// Getters para la plantilla
	get searchText() { return this.store.searchText(); }
	get states() { return this.store.states(); }
	get recentBranches() { return this.store.recentBranches(); }
	get topBranches() { return this.store.topBranches(); }
	get sucursalesCargadas() { return this.store.sucursalesCargadas(); }

	ngOnInit() {
		console.log(this.store.topBranches())
	}

	ngAfterViewInit() {
		this.branchesService.getTopBranches().subscribe((res: any) => {
			this.store.setTopBranches(res.data);
			this.displayPreloadTopBranches = false;
		});
	}

	close() {
		this.dialogRef.close();
	}

	// onStateSelected(state: any) {
	// 	this.store.setSelectedState(state);

	// 	this.branchesService.getRecentBranches(state.idEstado).subscribe(res => {
	// 		this.store.setSucursales(res.data[0].municipios);
	// 	});
	// }

	onStateSelected(state: any) {
		this.store.setHasInvalidChars(false);
		this.store.setNoResults(false);

		this.store.setSelectedState(state);

		this.branchesService.getRecentBranches(state.idEstado).subscribe(res => {
			this.store.setSucursales(res.data[0].municipios);
		});
	}

	// onSearchChange(text: string) {
	// 	this.store.setSearchText(text);

	// 	this.branchesService.getStates(text).subscribe(res => {
	// 		this.store.setStates(res.data);
	// 	});
	// }

	onSearchChange(text: string) {
		this.store.setSearchText(text);

		// Reset total de UI
		this.store.setHasInvalidChars(false);
		this.store.setNoResults(false);
		this.store.setStates([]);
		this.store.setSucursales(null);
		this.store.setRecentBranches([]);

		// Texto vacío → estado inicial (TOP)
		if (!text.trim()) {
			return;
		}

		// ❌ Caracteres inválidos
		if (this.hasWeirdChars(text)) {
			this.store.setHasInvalidChars(true);
			return;
		}

		// 🔍 Buscar estados
		this.branchesService.getStates(text).subscribe(res => {
			const data = res?.data ?? [];

			const noResults =
				res?.status === '404' ||
				data.length === 0 ||
				(data.length === 1 && data[0]?.idEstado === 0);

			if (noResults) {
				this.store.setNoResults(true);
				this.store.setStates([]);
				return;
			}

			this.store.setStates(data);
		});
	}


	isExpanded(index: number): boolean {
		return this.store.isMunicipioExpanded(index);
	}

	toggleMunicipio(index: number): void {
		this.store.toggleMunicipio(index);
	}

	onSucursalClick(item: any, municipio: any): void {
		this.store.setSelectedSucursal(item, municipio);
		this.dialogRef.close();
	}

	private hasWeirdChars(text: string): boolean {
		// Solo letras y espacios (acentos incluidos)
		return !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(text);
	}
}