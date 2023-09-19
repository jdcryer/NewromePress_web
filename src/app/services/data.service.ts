import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IQueryData } from '../interfaces/smart-data-list';

@Injectable({
  providedIn: 'root'
})
export class DataService {

	constructor(private http: HttpClient) { }

	private sharedData: any = null;
	
	public httpGET(url: string, httpOptions: any = null): Observable<any> {
		if(httpOptions){
			return this.http.get(url, httpOptions);
		}else{
			return this.http.get(url);
		}
	}
	public httpPOST(url: string, body: any): Observable<any> {
		return this.http.post(url, body);
	}
	private httpDELETE(url: string): Observable<any> {
		return this.http.delete(url);
	}

	private onError(error: any){
		// TODO Proper error handling...
		console.log(error);
	}

	/**
	 * Performs HTTP request according to given params to the given resource
	 * @param resource endpoint resource to pull data from
	 * @param queryString Name/Value pairs to append to the url
	 * @param onPass Success Callback, is passed response body
	 * @param onFail Error Callback, is passed error reponse
	 * @param queryObj Query Data to POST as body
	 * @param selectToken True to return the Select Token from the server
	 * @param httpOptions HTTP Options
	 */
	public getData(resource: string, queryString: string, onPass: Function, onFail: any = null, queryObj: IQueryData | null = null, selectToken: boolean = false, httpOptions: any = null) {
		let url = `${environment.apiSettings.endpoint}${resource}${(selectToken) ? '/selectToken' : ''}${(queryObj) ? '/query' : ''}${(queryString != '') ? `?${queryString}` : ''}`;
		if(queryObj){
			this.httpPOST(url, queryObj).subscribe((data: any) => {
				onPass(data);
			},
			(error: any) => {
				if(onFail) onFail(error);
				else this.onError(error);	
			});
			
		}else{
			this.httpGET(url,httpOptions).subscribe((data: any) => {
				onPass(data);	
			},
			(error: any) => {
				if(onFail) onFail(error);
				else this.onError(error);
			});
		}
	}

	/**
	 * Performs HTTP request according to given params to the given resource,
	 * Only to be used for performing Subset / Omit operations on the existing selection
	 * @param resource endpoint resource to pull data from
	 * @param queryString Name/Value pairs to append to the url
	 * @param onPass Success Callback, is passed response body
	 * @param onFail Error Callback, is passed error reponse
	 * @param subsetObj Subset Data to POST as body
	 * @param type 'subset' or 'omitset' operation
	 * @param httpOptions HTTP Options
	 */
	public getSubsetToken(resource: string, queryString: string, onPass: Function, onFail: any = null, subsetObj: any = null, type: 'subset' | 'omitset', httpOptions: any = null) {
		let url = `${environment.apiSettings.endpoint}${resource}/selectToken/${type}${(queryString != '') ? `?${queryString}` : ''}`;
		if(subsetObj){
			this.httpPOST(url, subsetObj).subscribe((data: any) => {
				onPass(data);
			},
			(error: any) => {
				if(onFail) onFail(error);
				else this.onError(error);	
			});
		}
	}

	/**
	 * Performs HTTP request according to given params to the given resource,
	 * Only to be used for performing Subset / Omit operations on the existing selection
	 * @param resource endpoint resource to pull data from
	 * @param queryString Name/Value pairs to append to the url
	 * @param onPass Success Callback, is passed response body
	 * @param onFail Error Callback, is passed error reponse
	 * @param subsetObj Subset Data to POST as body
	 * @param type 'subset' or 'omitset' operation
	 * @param httpOptions HTTP Options
	 */
	public getSubsetData(resource: string, queryString: string, subsetObj: any, type: 'subset' | 'omitset', httpOptions: any = null): Promise<any> {
		let url = `${environment.apiSettings.endpoint}${resource}/${type}${(queryString != '') ? `?${queryString}` : ''}`;
		return this.httpPOST(url, subsetObj).toPromise();
	}

	public asyncGetData(resource: string, queryString: string = '', httpOptions: any = null): Promise<any> {
		let url = `${environment.apiSettings.endpoint}${resource}${(queryString != '') ? `?${queryString}` : ''}`;
		return this.httpGET(url, httpOptions).toPromise();
	}

	/**
	 * Performs HTTP POST request according to given resource
	 * @param resource endpoint resource to post data to
	 * @param body request data to send to server
	 * @param onPass Success Callback, is passed response body
	 * @param onFail Error Callback, is passed error response
	 */
	public postData(resource: string, body: any, onPass: Function, onFail: any = null) {
		let url = `${environment.apiSettings.endpoint}${resource}`
		this.httpPOST(url, body).subscribe((data: any) => {
			onPass(data);
		},
		(error: any) => {
			if(onFail) onFail(error);
			else this.onError(error);
		});
	}

	/**
	 * Performs HTTP DELETE request according to given resource and id
	 * @param resource endpoint resource to post data to
	 * @param id primary key of record to be deleted
	 * @param onPass Success Callback, is passed response body
	 * @param onFail Error Callback, is passed error response
	 */
	public deleteData(resource: string, id: string | number | undefined, onPass: Function, onFail: any = null) {
		let url = `${environment.apiSettings.endpoint}${resource}/${id}`;
		this.httpDELETE(url).subscribe((data: any) => {
			onPass(data);
		},
		(error: any) => {
			if(onFail) onFail(error);
			else this.onError(error);
		});
	}

    setStoredData (property : string, data : any) {
		if(!this.sharedData) this.sharedData = {};
        this.sharedData[property] = data;
    }
    getStoredData (property : string) : any {
		if(!this.sharedData) return null
        return this.sharedData[property];
    }

}
