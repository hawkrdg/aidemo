import { Component, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import OpenAI from 'openai';
import { animate } from '@angular/animations';

import { cloneDeep } from "lodash-es";

const httpHeaders = new HttpHeaders(
  {
    'Content-Type':  'text/plain'
  }
) 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fade', [
      state('visible', style({opacity: 1, 'z-index': 100, left: '20px'})),
      state('hidden', style({opacity: 0, 'z-index': -1, left: 'calc(90vw - 400px)'})),
      transition('visible => hidden', [
        animate('0.6s ease-in-out'),
      ]),
      transition('hidden => visible', [
        animate('0.6s ease-in-out'),
      ])
    ])
  ]
}) export class AppComponent {
  title             = 'OpenAI Simple Demo';
  requestURL        = 'https://hawkrdg.com/openai';
  
  pwType            = 'password';
  unlockKey         = '';

  currentResult     = {
    text: '',
    object: '',
    id: '',
    model: '',
    finish_reason: '',
    total_tokens: 0,
    prompt_tokens: 0,
    completion_tokens: 0
  };
  
  textPrompt        = '';
  model             = 'text-davinci-003';
  temperature       = 0.8;
  frequency_penalty = 0.0;
  presence_penalty  = 0.0;
  max_tokens        = 48;

  imagePrompt       = '';
  imageURL          = '';
  imageSize         = '512x512';
  imageFormat       = ''

  count             = 1;

  showParameters    = false;
  showResults       = false;
  showProgress      = false;

  completionCreated = null;

  @ViewChild('txtUnlockKey') txtUnlockKey: ElementRef;

  constructor(
    private http: HttpClient
  ) {}

  getIdea = async () => {
    console.log('getIdea()...');
    this.currentResult = {
      text: '',
      object: '',
      id: '',
      model: '',
      finish_reason: '',
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0
    };

    this.showParameters = false;
    this.showResults = false;
    this.completionCreated = null;
    this.imageURL = '';
    this.imageFormat = '';

    this.showProgress = true;
    const requestBody = {
      key: this.unlockKey,
      method: 'getIdea',
      prompt: this.textPrompt,
      model: this.model,
      count: this.count,
      temperature: this.temperature,
      frequency_penalty: this.frequency_penalty,
      presence_penalty: this.presence_penalty,
      max_tokens: this.max_tokens
    }

    //-- for testing & development ONLY, apiKey is exposed for production...
    //
    // const ai = new OpenAI({apiKey: 'my_openai_api_key', dangerouslyAllowBrowser: true});
    // const imageObj = await ai.completions.create(requestBody).then(
    await firstValueFrom(this.http.post(this.requestURL, requestBody,
                          {observe: 'body', responseType: 'json'})).then(
      data => {
        this.showResults = true;
        this.currentResult.object = (data as any).object;
        this.currentResult.id = (data as any).id;
        this.currentResult.model = (data as any).model;
        this.currentResult.finish_reason = (data as any).choices[0].finish_reason;
        this.currentResult.total_tokens = (data as any).usage.total_tokens;
        this.currentResult.prompt_tokens = (data as any).usage.prompt_tokens;
        this.currentResult.completion_tokens = (data as any).usage.completion_tokens;
        this.currentResult.text = (data as any).choices[0].text
        const date = new Date();
        date.setTime((data as any).created * 1000);
        this.completionCreated = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
      err => {
        this.currentResult.text = JSON.stringify(err.error, null, 2);
      }
    );
    this.showProgress = false;
  }

  getImage = async () => {
    console.log('getImage()...');
    
    this.currentResult = {
      text: '',
      object: '',
      id: '',
      model: '',
      finish_reason: '',
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0
    };
    this.completionCreated = null;
    this.showParameters = false;
    this.showResults = false;
    this.imageURL = '';
    this.imageFormat = 'url';
    
    this.showProgress = true;
    const requestBody = {
      key: this.unlockKey,
      method: 'getImage',
      prompt: this.textPrompt,
      count: this.count,
      size: this.imageSize,
      format: this.imageFormat
    }

    //-- for testing & development ONLY, apiKey is exposed for production...
    //
    // const ai = new OpenAI({apiKey: 'my_openai_api_key', dangerouslyAllowBrowser: true});
    // const imageObj = await ai.images.generate(requestBody).then(
    await firstValueFrom(this.http.post(this.requestURL, requestBody,
                          {observe: 'body', responseType: 'json'})).then(
      data => {
        if ((data as any).data) {
          this.showResults = true;
          this.imageURL = (data as any).data[0].url;
          this.currentResult.object = 'image';
          const date = new Date();
          date.setTime((data as any).created * 1000);
          this.completionCreated = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }
      },
      err => {
        this.currentResult.text = JSON.stringify(err.error, null, 2);
      }
    );
    this.showProgress = false;
  }

  getModels = async () => {
    console.log('getModels()...');
    this.currentResult = {
      text: '',
      object: '',
      id: '',
      model: '',
      finish_reason: '',
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0
    };
    this.imageURL = '';
    this.imageFormat = ''
    this.showParameters = false;
    this.showResults = false;
    this.showProgress = true;
    const requestBody = {key: this.unlockKey, method: 'getModels'}

    //-- for testing & development ONLY, apiKey is exposed for production...
    //
    // const ai = new OpenAI({apiKey: 'my_openai_api_key', dangerouslyAllowBrowser: true});
    // await ai.models.list().then(
    await firstValueFrom(this.http.post(this.requestURL, requestBody, 
                          {observe: 'body', responseType: 'json'})).then(
      data => {
        this.showResults = true;
        this.currentResult.object = (data as any).object;
        this.currentResult.text = JSON.stringify((data as any).data.map(r => r.id), null, 2); 
        const date = new Date();
        this.completionCreated = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
      err => {
        this.currentResult.text = JSON.stringify(err.error, null, 2);
      }
    );
    this.showProgress = false;
  }
}



