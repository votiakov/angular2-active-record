import {Injectable}                      from "@angular/core";
import {Response}                        from "@angular/http";
import {Headers, RequestOptions}         from "@angular/http";
import "rxjs/add/operator/toPromise";
export interface MethodHttp {
  query?: string;
  update?: string;
  insert?: string;
  delete?: string;
  [method: string]: string;
}
export interface IBApiConfig {
  urlAPI?: string;
  headers?: any;
  methods?: MethodHttp;
}
export class ApiConfig {
  public urlAPI: string;
  public headers: any;
  public methods: MethodHttp;
  public defaultMethods: MethodHttp = {
    query: "get",
    update: "put",
    insert: "post",
    delete: "delete"
  };
  constructor(config?: IBApiConfig) {
    config = config || <any> {};
    this.urlAPI = config.urlAPI || "http://localhost:3456/api/";
    this.headers = config.headers || {};
    this.methods = config.methods || <any> {};
    for (const method in this.defaultMethods) {
      if (this.defaultMethods.hasOwnProperty(method)) {
        this.methods[method] = this.methods[method] || this.defaultMethods[method];
      }
    }
  }
  public getConfig() {
    return {
      urlAPI: this.urlAPI,
      headers: this.headers,
      methods: this.methods
    };
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
  public findAll(params: any = { page: 1, sort: "" }): Promise<T[]> {
    return this.httpService[this._config.methods.query](this.api_url + this.generateParam(params))
      .toPromise()
      .then((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}/search?title=abc&page=1&sort=title
  public search(data: any, api_search_name: string = ""): Promise<T[]> {
    return this.httpService[this._config.methods.query](this.api_url + "/" + api_search_name + this.generateParam(data))
      .toPromise()
      .then((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}/${id}
  public find(id: any): Promise<T> {
    return this.httpService[this._config.methods.query](this.api_url + "/" + id)
      .toPromise()
      .then((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}/${id}
  public update(id: any, data: any) {
    const body = JSON.stringify(data);
    if (!this._config.headers["Content-Type"]) {
      this._config.headers["Content-Type"] = "application/json";
    }
    const headers = new Headers(this._config.headers);
    const options = new RequestOptions({ headers });
    return this.httpService[this._config.methods.update](this.api_url + "/" + id, body, options)
      .toPromise()
      .then((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}
  public insert(data: any) {
    const body = JSON.stringify(data);
    if (!this._config.headers["Content-Type"]) {
      this._config.headers["Content-Type"] = "application/json";
    }
    const headers = new Headers(this._config.headers);
    const options = new RequestOptions({ headers });
    return this.httpService[this._config.methods.insert](this.api_url, body, options)
      .toPromise()
      .then((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  // Ex:[GET] /${table_name}/${id}
  public delete(id: any) {
    const headers = new Headers(this._config.headers);
    const options = new RequestOptions({ headers });
    return this.httpService[this._config.methods.delete](this.api_url + "/" + id, options)
      .toPromise()
      .then((res: Response) => this.processData(res))
      .catch(this.handleError);
  }
  protected generateParam(params: any = {}): string {
    const paramsArr: string[] = [];
    for (const key in params) {
      if (params[key]) {
        paramsArr.push(key + "=" + params[key]);
      }
    }
    return "?" + paramsArr.join("&");
  }
  protected processData(res: Response) {
    return <T> res.json();
  }
  protected handleError(error: any): Promise<any> {
    console.error("An error occurred", error);
    return Promise.reject(error.message || error);
  }
}
