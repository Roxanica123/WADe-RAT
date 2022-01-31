import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public languages: Language[] = Languages.languages;
  public selected = Languages.languages[0].value;
  public displayedColumns = ["Query"]
  
  public show_query:string[] = [];

  userForm = this.formBuilder.group({
    openApiDocumentUrl: ['', Validators.required],
    language: ['', Validators.required],
    sentence: ['', Validators.required],
  });

  constructor(private readonly formBuilder: FormBuilder,
    private readonly requestsService: RequestsService,
    private readonly snack: SnackService
    ) { }

  ngOnInit(): void {
  }

  public async onSubmit() {
    const rez:any =  await this.requestsService.post<MatchReasponse | NoMatchReasponse>(environment.gatewayURL, this.userForm.value).catch ( (error) => {
      this.snack.error("Ther has been a problem! " + error.message);
    });

    console.log(rez);
    
    if ( rez.url  ){

      this.show_query = [rez.url];
      console.log(this.show_query);
    } 
   
    if ( rez.suggestions ){
      if ( rez.suggestions.length == 0){
        this.show_query = [];
        this.snack.error("\t\tNo route found!\t\t");
        return;
      }

      this.show_query = rez.suggestions;
      console.log(this.show_query);
    }


     this.snack.info("\t\tSucces!\t\t");

  }
  

  public clickMe(row:string):void{
    console.log("row=>", row)
  }
}
