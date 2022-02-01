import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


    public get observable() {
        return this.loadingSubject.asObservable();
    }

    public setLoading() {
        this.loadingSubject.next(true);
    }

    public stopLoading() {
        this.loadingSubject.next(false);
    }
}