import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { RequestsService } from 'src/app/services/requests.service';
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

  userForm = this.formBuilder.group({
    openApiDocumentUrl: ['', Validators.required],
    language: ['', Validators.required],
    sentence: ['', Validators.required],
  });

  constructor(private readonly formBuilder: FormBuilder,
    private readonly requestsService: RequestsService) { }

  ngOnInit(): void {
  }
  async onSubmit() {
    console.log(await this.requestsService.post(environment.gatewayURL, this.userForm.value));
  }
}
