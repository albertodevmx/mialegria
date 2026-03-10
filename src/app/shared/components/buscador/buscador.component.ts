import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription, switchMap, debounceTime, of } from 'rxjs';

import { BranchesService } from './../../../services/branches.service';
import { BranchesStore } from './../../../stores/branches.store';

type SearchItem = { idRow: number; idProducto: number; producto: string };

@Component({
	selector: 'app-buscador',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './buscador.component.html',
	styleUrl: './buscador.component.scss'
})
export class BuscadorComponent implements OnInit, OnDestroy {
	private branchesService = inject(BranchesService);
	private store = inject(BranchesStore);
	private router = inject(Router);
	private search$ = new Subject<string>();
	private searchSub!: Subscription;

	familias = this.store.webFamilies;
	items = signal<SearchItem[]>([]);
	private currentQuery = '';
	private isLoadingMore = false;
	private hasMore = true;

	ngOnInit(): void {
		if (this.store.webFamiliesAll().length === 0) {
			this.branchesService.getAllWebFamily().subscribe({
				next: (res: any) => {
					if (String(res?.status) === '200' && Array.isArray(res?.data)) {
						this.store.setWebFamiliesAll(res.data);

						const map = new Map<string, { idFamiliaWeb: number; familiaWeb: string }>();
						for (const item of res.data) {
							if (!map.has(item.familiaWeb)) {
								map.set(item.familiaWeb, {
									idFamiliaWeb: item.idFamiliaWeb,
									familiaWeb: item.familiaWeb,
								});
							}
						}
						this.store.setWebFamilies(Array.from(map.values()));
					}
				}
			});
		}

		this.searchSub = this.search$.pipe(
			debounceTime(200),
			switchMap(query => {
				this.currentQuery = query;
				this.hasMore = true;
				this.isLoadingMore = false;

				if (!query) {
					this.items.set([]);
					return of(null);
				}
				return this.branchesService.getServicesInSearcher(query, 1);
			})
		).subscribe({
			next: (res: any) => {
				if (!res) return;
				if (String(res?.status) === '200' && Array.isArray(res?.data)) {
					this.items.set(res.data);
					this.hasMore = res.data.length > 0;
				} else {
					this.items.set([]);
				}
			},
			error: (err) => {
				console.error('Error en buscador:', err);
				this.items.set([]);
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
		const currentItems = this.items();
		if (nearBottom && !this.isLoadingMore && this.hasMore && currentItems.length > 0) {
			const lastIdRow = currentItems[currentItems.length - 1].idRow;
			this.loadMore(lastIdRow);
		}
	}

	private loadMore(skip: number) {
		this.isLoadingMore = true;
		this.branchesService.getServicesInSearcher(this.currentQuery, skip).subscribe({
			next: (res: any) => {
				this.isLoadingMore = false;
				if (String(res?.status) === '200' && Array.isArray(res?.data)) {
					if (res.data.length === 0) {
						this.hasMore = false;
					} else {
						this.items.update(prev => [...prev, ...res.data]);
					}
				} else {
					this.hasMore = false;
				}
			},
			error: () => {
				this.isLoadingMore = false;
			}
		});
	}

	onFamiliaChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const idFamilia = select.value;
		if (idFamilia) {
			this.router.navigate(['/categorias'], {
				queryParams: { idFamilia },
			});
		}
		select.value = '';
	}

	selectItem(item: SearchItem) {
		console.log('Elemento clickeado:', item);
		this.items.set([]);
	}
}
