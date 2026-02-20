import { Component, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { BranchesService } from './../../../services/branches.service';

export interface Category {
	id: string;
	name: string;
}

@Component({
	selector: 'app-buscador',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './buscador.component.html',
	styleUrl: './buscador.component.scss'
})
export class BuscadorComponent {
	private branchesService = inject(BranchesService);
	private elementRef = inject(ElementRef);

	items: Array<{ idProducto: number; producto: string }> = [];
	showAutocomplete = false;

	// Dropdown de categorías
	dropdownOpen = false;
	selectedCategory: string | null = null;

	categories: Category[] = [
		{ id: 'estudios-clinicos', name: 'Estudios clínicos' },
		{ id: 'rayos-x', name: 'Rayos X' },
		{ id: 'ultrasonidos', name: 'Ultrasonidos' },
		{ id: 'tomografia', name: 'Tomografía' },
		{ id: 'resonancia', name: 'Resonancia' },
		{ id: 'neurologia', name: 'Neurología' },
		{ id: 'cardiologia', name: 'Cardiología' },
		{ id: 'neumologia', name: 'Neumología' },
		{ id: 'ginecologia', name: 'Ginecología' },
		{ id: 'gastroenterologia', name: 'Gastroenterología' },
		{ id: 'dental', name: 'Dental' },
		{ id: 'densitometria', name: 'Densitometría' },
	];

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: Event) {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.dropdownOpen = false;
		}
	}

	toggleDropdown() {
		this.dropdownOpen = !this.dropdownOpen;
	}

	selectCategory(category: Category) {
		this.selectedCategory = this.selectedCategory === category.id ? null : category.id;
	}

	selectAll() {
		this.selectedCategory = null;
		this.dropdownOpen = false;
	}

	get displayLabel(): string {
		if (!this.selectedCategory) return 'Categorías';
		const found = this.categories.find(c => c.id === this.selectedCategory);
		return found ? found.name : 'Categorías';
	}

	onSearch(query: string) {
		query = (query || '').trim();

		if (query.length < 3) {
			this.items = [];
			this.showAutocomplete = false;
			return;
		}

		this.branchesService.getServicesInSearcher(query).subscribe({
			next: (res: any) => {
				const statusOk = String(res?.status) === '200';

				if (statusOk && Array.isArray(res?.data)) {
					this.items = res.data.slice(0, 8);
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