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

	items: Array<{ idRow: number; idProducto: number; producto: string }> = [];
	showAutocomplete = false;
	private currentQuery = '';
	private isLoading = false;
	private hasMore = true;

	onSearch(query: string) {
		query = (query || '').trim();
		this.currentQuery = query;

		if (!query) {
			this.items = [];
			this.showAutocomplete = false;
			this.hasMore = true;
			return;
		}

		this.items = [];
		this.hasMore = true;
		this.fetchResults(query, 1);
	}

	onScroll(event: Event) {
		const el = event.target as HTMLElement;
		const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
		if (nearBottom && !this.isLoading && this.hasMore && this.items.length > 0) {
			const lastIdRow = this.items[this.items.length - 1].idRow;
			this.fetchResults(this.currentQuery, lastIdRow);
		}
	}

	private fetchResults(query: string, skip: number) {
		this.isLoading = true;
		this.branchesService.getServicesInSearcher(query, skip).subscribe({
			next: (res: any) => {
				this.isLoading = false;
				if (String(res?.status) === '200' && Array.isArray(res?.data)) {
					if (res.data.length === 0) {
						this.hasMore = false;
					} else {
						this.items = [...this.items, ...res.data];
						this.showAutocomplete = true;
					}
				} else {
					this.hasMore = false;
					if (this.items.length === 0) {
						this.showAutocomplete = false;
					}
				}
			},
			error: (err) => {
				console.error('Error en buscador:', err);
				this.isLoading = false;
				if (this.items.length === 0) {
					this.showAutocomplete = false;
				}
			}
		});
	}

	selectItem(item: any) {
		console.log('Elemento clickeado:', item);
		this.showAutocomplete = false;
	}
}
