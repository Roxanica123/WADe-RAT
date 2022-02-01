import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
    providedIn: 'root'
})

export class SnackService {

    constructor(private _snackBar: MatSnackBar) { }

    public info(message: string): void {
        this._snackBar.open(message, "", {
            duration: 4000,
            panelClass: ["snack-info"]
        });
    }

    public error(message: string): void {
        this._snackBar.open(message, "", {
            duration: 5000,
            panelClass: ["snack-error"]
        });
    }
}