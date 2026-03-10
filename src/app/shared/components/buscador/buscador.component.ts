import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription, switchMap, debounceTime, of } from 'rxjs';

import { BranchesService } from './../../../services/branches.service';

@Component({
	selector: 'app-buscador',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './buscador.component.html',
	styleUrl: './buscador.component.scss'
})
export class BuscadorComponent implements OnInit, OnDestroy {
	private branchesService = inject(BranchesService);
	private search$ = new Subject<string>();
	private searchSub!: Subscription;

	items: Array<{ idRow: number; idProducto: number; producto: string }> = [];
	showAutocomplete = false;
	private currentQuery = '';
	private isLoading = false;
	private hasMore = true;

	ngOnInit(): void {
		this.searchSub = this.search$.pipe(
			debounceTime(300),
			switchMap(query => {
				if (!query) {
					this.items = [];
					this.showAutocomplete = false;
					this.hasMore = true;
					return of(null);
				}
				this.currentQuery = query;
				this.hasMore = true;
				this.isLoading = true;
				return this.branchesService.getServicesInSearcher(query, 1);
			})
		).subscribe({
			next: (res: any) => {
				if (!res) return;
				this.isLoading = false;
				if (String(res?.status) === '200' && Array.isArray(res?.data)) {
					this.items = res.data;
					this.showAutocomplete = this.items.length > 0;
					this.hasMore = res.data.length > 0;
				} else {
					this.items = [];
					this.showAutocomplete = false;
				}
			},
			error: (err) => {
				console.error('Error en buscador:', err);
				this.isLoading = false;
			}
		});
	}

	ngOnDestroy(): void {
		this.searchSub?.unsubscribe();
	}

	onSearch(query: string) {
		this.search$.next((query || '').trim());
	}

	onScroll(event: Event) {
		const el = event.target as HTMLElement;
		const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
		if (nearBottom && !this.isLoading && this.hasMore && this.items.length > 0) {
			const lastIdRow = this.items[this.items.length - 1].idRow;
			this.loadMore(lastIdRow);
		}
	}

	private loadMore(skip: number) {
		this.isLoading = true;
		this.branchesService.getServicesInSearcher(this.currentQuery, skip).subscribe({
			next: (res: any) => {
				this.isLoading = false;
				if (String(res?.status) === '200' && Array.isArray(res?.data)) {
					if (res.data.length === 0) {
						this.hasMore = false;
					} else {
						this.items = [...this.items, ...res.data];
					}
				} else {
					this.hasMore = false;
				}
			},
			error: () => {
				this.isLoading = false;
			}
		});
	}

	selectItem(item: any) {
		console.log('Elemento clickeado:', item);
		this.showAutocomplete = false;
	}
}
