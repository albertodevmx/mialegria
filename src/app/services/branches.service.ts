import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class BranchesService {
	private baseUrl = 'https://portal.ssdrsimi.com.mx/APISIMILABDEV';

	constructor(private http: HttpClient) { }


	getStates(query: string): Observable<any> {
		return this.http.get(`${this.baseUrl}/api/Branches/States`, {
			params: { Estado: query }
		});
	}


	getRecentBranches(EstadoId: any): Observable<any> {
		return this.http.get(`${this.baseUrl}/api/Branch/nerestsBranches?IDEstado=${EstadoId}`);
	}


	getTopBranches(): Observable<any> {
		return this.http.get(`${this.baseUrl}/api/Branches/topBranches?Max=3`);
	}

	getServicesInSearcher(query: string): Observable<any> {
		return this.http.get(`${this.baseUrl}/api/Branches/searchProducts?Producto=${query}`);
	}


	// Familias
	getAllWebFamily(): Observable<any> {
		return this.http.get(
			`${this.baseUrl}/api/Branches/AllWebFamily`
		);
	}


	getTopProducts(max: number = 6): Observable<any> {
		return this.http.get(
			`${this.baseUrl}/api/Branches/topProducts?Max=${max}`
		);
	}

}
