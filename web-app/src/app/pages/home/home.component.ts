import { HttpHeaders } from '@angular/common/http';
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

class SegmentedUrl {
  constructor(public readonly routeData: string[], public readonly url: string) { }
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
  public query_missing_params: string[] = [];


  public showTable: boolean = false;
  public showForm: boolean = false;
  public showQueryRes: boolean = false;

  public headers: string[] = [];

  public q_res: string = "";

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

  ngOnInit(): void { }

  private manageForm(rez: MatchReasponse | NoMatchReasponse | any): void {

    console.log("Received from Azure Functions:");
    console.log(rez)

    this.showForm = false;
    this.showTable = false;

    if (rez.url) {

      const segments = this.parseUrl(rez.url);

      if (segments.routeData.length > 0) {
        this.query_missing_params = segments.routeData.map(x => x);
        this.query_missing_params.forEach(x => this.accesUrlFrom.addControl(x, new FormControl("", Validators.required)));
      }

      this.displayedColumns = ["HTTPVerb", "Query"];
      this.show_query = [new Visualize(segments.url, rez.method, rez.headers)];
      this.table_title = "This is the route we think you want."
      this.showForm = true;

      this.headers = Object.keys(this.show_query[0].headers);

      for (const el of this.headers) {
        this.accesUrlFrom.addControl(el, new FormControl("", Validators.required));
      }
      this.accesUrlFrom.patchValue(
        {
          "RoutVerb": rez.method,
          "RoutUrl": segments.url
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
    const { Body, RoutUrl, RoutVerb } = this.accesUrlFrom.value;
    let newUrl = `${RoutUrl}`;

    let requestHeaders: any = { 'Content-Type': 'application/json' };

    for (const key of this.headers) {
      requestHeaders[key] = this.accesUrlFrom.value[key];
    }

    for (const key of this.query_missing_params) {
      newUrl = newUrl.replace(key, this.accesUrlFrom.value[key])
    }

    console.log("Preparing to send URL & HEADERS");
    console.log(requestHeaders);
    console.log(newUrl);

    const rez: MatchReasponse | NoMatchReasponse | any = await this.requestsService.getWithHeaders<MatchReasponse | NoMatchReasponse>(newUrl, requestHeaders).catch((error) => {
      this.snack.error("Ther has been a problem! " + error.message);
      this.showQueryRes = false;
    });
    this.showQueryRes = true;
    this.q_res = JSON.stringify(rez, undefined, "\t");
  }

  public async clickMe(row: Visualize): Promise<void> {

    const myobj = this.userForm.value;
    myobj.language = Languages.languages[0].value;
    console.log('row-->', row);
    myobj.path = row.url

    const rez: MatchReasponse | NoMatchReasponse | any = await this.requestsService.post<MatchReasponse | NoMatchReasponse>(environment.gatewayURL, myobj).catch((error) => {
      this.snack.error("Ther has been a problem! " + error.message);
    });

    this.manageForm(rez);
  }

  private parseUrl(url: string): SegmentedUrl {
    const data: string[] = [];
    let replaced = `${url}`;
    let index = 0;
    while (true) {
      if (replaced.indexOf("{you_need_to_add_it}") > -1) {
        const paramName = `{required_parameter_${index}}`;
        replaced = replaced.replace("{you_need_to_add_it}", paramName);
        data.push(paramName);
        index++;
      }
      else {
        break;
      }
    }

    return new SegmentedUrl(data, replaced);
  }
}
