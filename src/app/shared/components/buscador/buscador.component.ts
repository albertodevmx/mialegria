import { Component, inject, signal } from '@angular/core';
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

	items = signal<Array<{ idProducto: number; producto: string }>>([]);
	showAutocomplete = signal(false);

	onSearch(query: string) {
		query = (query || '').trim();

		// Resetear si el query está vacío
		if (!query) {
			this.items.set([]);
			this.showAutocomplete.set(false);
			return;
		}

		// Solo llamar al servicio si hay 3 o más caracteres
		if (query.length < 3) {
			this.items.set([]);
			this.showAutocomplete.set(false);
			return;
		}

		this.branchesService.getServicesInSearcher(query).subscribe({
			next: (res: any) => {
				const statusOk = String(res?.status) === '200';

				if (statusOk && Array.isArray(res?.data)) {
					this.items.set(res.data);
					this.showAutocomplete.set(true);
				} else {
					this.items.set([]);
					this.showAutocomplete.set(true); // Mostrar panel para el mensaje "No encontraron coincidencias"
				}
			},
			error: (err) => {
				console.error('Error en buscador:', err);
				this.items.set([]);
				this.showAutocomplete.set(true); // Mostrar panel para el mensaje de error
			}
		});
	}

	selectItem(item: any) {
		console.log('Elemento clickeado:', item);
		this.showAutocomplete.set(false);
	}
}