import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private readonly headers = { 'Content-Type': 'application/json' };

  constructor(private readonly http: HttpClient,
    private readonly loading: LoadingService) { }

  public async get<T>(url: string): Promise<any> {
    try {
      this.loading.setLoading();
      const res = await lastValueFrom(this.http.get<T>(url, { headers: this.headers }));
      return res;
    }
    catch (err) {
      throw err;
    }
    finally {
      this.loading.stopLoading();
    }
  }

  public async post<T>(url: string, data: any): Promise<any> {
    try {
      this.loading.setLoading();
      const res = await lastValueFrom(this.http.post<T>(url, data, { headers: this.headers }));

      return res;
    }
    catch (err) {
      throw err;
    }
    finally {
      this.loading.stopLoading();
    }
  }

  public async getWithHeaders<T>(url: string, h: any): Promise<any> {
    try {
      this.loading.setLoading();
      const res = await lastValueFrom(this.http.get<T>(url, { headers: h }));

      return res;
    }
    catch (err) {
      throw err;
    }
    finally {
      this.loading.stopLoading();
    }
  }


}
