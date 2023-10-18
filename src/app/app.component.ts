import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import OpenAI from 'openai';

const httpHeaders = new HttpHeaders(
  {
    'Content-Type':  'text/plain'
  }
) 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
}) export class AppComponent {
  title             = 'OpenAI Simple Demo';
  requestURL        = 'https://hawkrdg.com/openai';
  unlockKey         = '';

  currentResult     = '';
  
  textPrompt        = '';
  model             = 'text-davinci-003';
  temperature       = 0.8;
  frequency_penalty = 0.0;
  presence_penalty  = 0.0;
  max_tokens        = 128;

  imagePrompt       = '';
  imageURL          = '';
  imageSize         = '256x256';
  imageFormat       = 'url'

  count             = 1;

  showProgress      = false;


  constructor(
    private http: HttpClient
  ) {}

  getIdea = async () => {
    console.log('getIdea()...');
    this.currentResult = '';
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
        this.currentResult = JSON.stringify(data, null, 2);
      },
      err => {
        this.currentResult = JSON.stringify(err.error, null, 2);
      }
    );
    this.showProgress = false;
  }

  getImage = async () => {
    console.log('getImage()...');
    this.imageURL = '';
    this.currentResult = '';
    this.showProgress = true;
    const requestBody = {
      key: this.unlockKey,
      method: 'getImage',
      prompt: this.imagePrompt,
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
        this.currentResult = JSON.stringify(data, null, 2);
        if ((data as any).data) {
          this.imageURL = (data as any).data[0].url;
        }
      },
      err => {
        this.currentResult = JSON.stringify(err.error, null, 2);
      }
    );
    this.showProgress = false;
  }

  getModels = async () => {
    console.log('getModels()...');
    this.currentResult = '';
    this.showProgress = true;
    const requestBody = {key: this.unlockKey, method: 'getModels'}

    //-- for testing & development ONLY, apiKey is exposed for production...
    //
    // const ai = new OpenAI({apiKey: 'my_openai_api_key', dangerouslyAllowBrowser: true});
    // await ai.models.list().then(
    await firstValueFrom(this.http.post(this.requestURL, requestBody, 
                          {observe: 'body', responseType: 'json'})).then(
      data => {
        this.currentResult = JSON.stringify((data as any).data.map(r => r.id), null, 2); 
      },
      err => {
        this.currentResult = JSON.stringify(err.error, null, 2);
      }
    );
    this.showProgress = false;
  }
}



