import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { RequestsService } from 'src/app/services/requests.service';
import { SnackService } from 'src/app/services/snack.service';
import { MatchReasponse, NoMatchReasponse } from 'src/app/types/dataType';
import { environment } from 'src/environments/environment';
import Languages from '../../../assets/languages.json';

interface Language {
  value: string;
  viewValue: string;
}

class Visualize {
  url!: string;
  http_verb!: string;
  headers!: object;

  constructor(_url: string, _verb: string, _headers: object) {
    this.url = _url;
    this.http_verb = _verb;
    this.headers = _headers;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public languages: Language[] = Languages.languages;
  public selected = Languages.languages[0].value;
  public displayedColumns = ["HTTPVerb", "Query"]
  public table_title: string = ""
  public show_query: Visualize[] = [];


  public showTable: boolean = false;
  public showForm: boolean = false;
  public headers: string[] = [];

  userForm = this.formBuilder.group({
    openApiDocumentUrl: ['', Validators.required],
    //language: ['', Validators.required],
    sentence: ['', Validators.required],
  });

  accesUrlFrom = this.formBuilder.group({
    RoutVerb: ['', Validators.required],
    RoutUrl: ['', Validators.required],
    Body: ['']
  });

  constructor(private readonly formBuilder: FormBuilder,
    private readonly requestsService: RequestsService,
    private readonly snack: SnackService
  ) { }

  ngOnInit(): void {
  }

  private manageForm(rez : MatchReasponse | NoMatchReasponse | any) : void {

    console.log(rez)

    this.showForm = false;
    this.showTable = false;

    if (rez.url) {
      this.displayedColumns = ["HTTPVerb", "Query"];
      this.show_query = [new Visualize(rez.url, rez.method, rez.headers)];
      this.table_title = "This is the route we think you want."
      this.showForm = true;

      this.headers = Object.keys(this.show_query[0].headers);
      
      for (const el of this.headers) {
        this.accesUrlFrom.addControl(el, new FormControl("", Validators.required));
      }
      this.accesUrlFrom.patchValue(
        {
          "RoutVerb": rez.method,
          "RoutUrl": rez.url
        }
      )
    }

    if (rez.suggestions) {
      if (rez.suggestions.length == 0) {
        this.show_query = [];
        this.snack.error("\t\tNo route found!\t\t");
        return;
      }

      let temp: Visualize[] = []

      for (let el of rez.suggestions) {
        temp.push(new Visualize(el, "", {}))
      }

      this.displayedColumns = ["Query"];
      this.show_query = temp;
      this.table_title = "Are you looking for one of these routes?"
      this.showTable = true;
    }
    this.snack.info("\t\tSucces!\t\t");
  }

  public async onSubmit() {
    const myobj = this.userForm.value;
    myobj.language = Languages.languages[0].value;
    const rez: MatchReasponse | NoMatchReasponse | any = await this.requestsService.post<MatchReasponse | NoMatchReasponse>(environment.gatewayURL, myobj).catch((error) => {
      this.snack.error("Ther has been a problem! " + error.message);
    });

    this.manageForm(rez);
  }


  public async onSend() {
    const {Body,RoutUrl,RoutVerb} = this.accesUrlFrom.value;

  
  }

  public async clickMe(row:Visualize): Promise<void> {

    const myobj = this.userForm.value;
    myobj.language = Languages.languages[0].value;
    console.log('row-->',row);
    myobj.path = row.url

    const rez: MatchReasponse | NoMatchReasponse | any = await this.requestsService.post<MatchReasponse | NoMatchReasponse>(environment.gatewayURL, myobj).catch((error) => {
      this.snack.error("Ther has been a problem! " + error.message);
    });

    this.manageForm(rez);

  }


}
