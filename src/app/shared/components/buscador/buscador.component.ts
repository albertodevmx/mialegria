import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


import { BranchesService } from './../../../services/branches.service';

@Component({
	selector: 'app-buscador',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './buscador.component.html',
	styleUrl: './buscador.component.scss'
})
export class BuscadorComponent {
	private branchesService = inject(BranchesService);


	items: Array<{ idProducto: number; producto: string }> = [];
	showAutocomplete = false;


	onSearch(query: string) {
		query = (query || '').trim();


		if (!query) {
			this.items = [];
			this.showAutocomplete = false;
			return;
		}


		this.branchesService.getServicesInSearcher(query).subscribe({
			next: (res: any) => {
				const statusOk = String(res?.status) === '200';


				if (statusOk && Array.isArray(res?.data)) {
					this.items = res.data;
					this.showAutocomplete = true;
				} else {
					this.items = [];
					this.showAutocomplete = false;
				}
			},
			error: (err) => {
				console.error('Error en buscador:', err);
				this.items = [];
				this.showAutocomplete = false;
			}
		});
	}


	selectItem(item: any) {
		console.log('Elemento clickeado:', item);
		this.showAutocomplete = false;
	}
}