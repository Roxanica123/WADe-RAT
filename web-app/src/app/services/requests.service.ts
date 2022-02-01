import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private readonly headers = { 'Content-Type': 'application/json' };

  constructor(private readonly http: HttpClient) { }

  public get<T>(url: string): Promise<any> {
    return lastValueFrom(this.http.get<T>(url, { headers: this.headers }));
  }

  public post<T>(url: string, data: any): Promise<any> {
    return lastValueFrom(this.http.post<T>(url, data, { headers: this.headers }));
  }

  public getWithHeaders<T>(url: string, h:any): Promise<any> {
    return lastValueFrom(this.http.get<T>(url, { headers: h }));
  }


}
