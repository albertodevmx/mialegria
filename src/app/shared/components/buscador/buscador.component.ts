import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription, switchMap, debounceTime, of, catchError } from 'rxjs';

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
	hasSearched = signal(false);

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
			debounceTime(300),
			switchMap(query => {
				if (!query) {
					this.items.set([]);
					this.hasSearched.set(false);
					return of(null);
				}
				return this.branchesService.getServicesInSearcher(query, 0).pipe(
					catchError(() => of({ status: '404', data: [] }))
				);
			})
		).subscribe({
			next: (res: any) => {
				if (!res) return;
				this.hasSearched.set(true);
				if (String(res?.status) === '200' && Array.isArray(res?.data)) {
					this.items.set(res.data);
				} else {
					this.items.set([]);
				}
			}
		});
	}

	ngOnDestroy(): void {
		this.searchSub?.unsubscribe();
	}

	onSearch(query: string) {
		this.search$.next((query || '').trim());
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
		this.hasSearched.set(false);
	}
}
