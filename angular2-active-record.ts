import {Injectable}                      from 'angular2/core';
import {Response}                        from 'angular2/http';
import {Headers, RequestOptions}         from 'angular2/http';
import {Observable}                      from 'rxjs/Observable';
import {ErrorObservable}                 from 'rxjs/Observable/ErrorObservable';

export interface MethodHttp {
  query: string;
  update: string;
  insert: string;
  delete: string;
  [method: string]: string;
}

export interface IBApiConfig {
  urlAPI: string;
  headers: any;
  methods: MethodHttp;
}

export class ApiConfig {
  config: any;
  urlAPI: string;
  headers: any;
  methods: MethodHttp;
  defaultMethods: MethodHttp = {
    query: "get",
    update: "put",
    insert: "post",
    delete: "delete"
  };
  constructor(config?: any) {
    this.config = config || {};
    this.urlAPI = this.config.urlAPI || "http://localhost:3456/api/"
    this.headers = this.config.headers || {};
    this.methods = this.config.methods || {};
    let method: string;
    for (method in this.defaultMethods) {
      this.methods[method] = this.methods[method] || this.defaultMethods[method];
    }
  }

  getConfig() {
    return {
      urlAPI: this.urlAPI,
      headers: this.headers,
      methods: this.methods
    }
  }
}

export class ActiveRecord<T> {
  public api_url: string;
  private _config: IBApiConfig;
  constructor(public options: ApiConfig, public httpService: any, protected table_name: string) {
    this._config = options.getConfig();
    this.api_url = this._config.urlAPI + "" + table_name;
  }

  // Ex:[GET] /${table_name}?page=1&sort=title
  findAll(params: any = { page: 1, sort: "" }): Observable<T> {
    return this.httpService[this._config.methods.query](this.api_url + this.generateParam(params))
      .map((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}/search?title=abc&page=1&sort=title
  search(data: any, api_search_name: string = ""): Observable<T> {
    return this.httpService[this._config.methods.query](this.api_url + "/" + api_search_name + this.generateParam(data))
      .map((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}/${id}
  find(id: any): Observable<T> {
    return this.httpService[this._config.methods.query](this.api_url + "/" + id)
      .map((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}/${id}
  update(id: any, data: any) {
    let body = JSON.stringify(data);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.httpService[this._config.methods.update](this.api_url + "/" + id, body, options)
      .map((res: Response) => res.json())
      .catch(this.handleError)
  }
  // Ex:[GET] /${table_name}
  insert(data: any) {
    let body = JSON.stringify(data);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.httpService[this._config.methods.insert](this.api_url, body, options)
      .map((res: Response) => this.processData(res))
      .catch(this.handleError)
  }
  // Ex:[GET] /${table_name}/${id}
  delete(id: any) {
    let headers = new Headers({});
    let options = new RequestOptions({ headers: headers });
    return this.httpService[this._config.methods.delete](this.api_url + "/" + id, options)
      .map((res: Response) => res.json())
      .catch(this.handleError);
  }

  protected generateParam(params: any = {}): string {
    let params_arr: Array<string> = [];
    for (let key in params) {
      if (params[key]) {
        params_arr.push(key + "=" + params[key]);
      }
    }
    return "?" + params_arr.join("&");
  }

  protected processData(res: Response) {
    return <T>res.json();
  }

  protected handleError(error: Response): ErrorObservable {
    return Observable.throw(new Error(error.json().join() || 'Server error'));
  }
}