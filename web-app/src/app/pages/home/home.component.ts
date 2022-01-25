import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
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

  constructor(private readonly formBuilder:FormBuilder) { }

  ngOnInit(): void {
  }
  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.userForm.value);
  }
}
