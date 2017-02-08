# andrii-test-angular2-active-record

**andrii-test-angular2-active-record** is a helper library for connect api in your Angular 2 applications.

## Installation

```bash
npm install andrii-test-angular2-active-record
```

## Usage

### config


Config main app:
```ts
import {ApiConfig} from 'angular2-active-record';

...

class App {

}

bootstrap(App, [
  HTTP_PROVIDERS,
  provide(ApiConfig, {
    useValue: new ApiConfig({
      urlAPI: "http://localhost:3456/api/"
    })
  }),

])
```

A default configuration for urlAPI, header, methods details is provided:

* urlAPI: `http://localhost:3456/api/`
* headers: {'Content-Type': 'application/json'}
* methods: {query: "get",update: "put", insert:"post",delete: "delete"}

If you wish to configure the `urlPI`, `headers`, `methods`, you can pass a config object when `ApiConfig` is injected.

```ts
...

bootstrap(App, [
  HTTP_PROVIDERS,
  provide(ApiConfig, {
    useValue: new ApiConfig({
      urlAPI: "http://localhost:3456/api/",
      headers: {},
      methods: {
        query: "get",
        update: "put",
        insert: "post",
        delete: "delete"
      }
    })
  }),
])
```

### Write services to connect api
Example: a service to connect api for `posts`, and have apis as follow:

```
[GET]http://localhost:3456/api/posts # get all post
[GET]http://localhost:3456/api/posts/1 # show detail a post
[POST]http://localhost:3456/api/posts # create a post
[PUT]http://localhost:3456/api/posts/1 # update for post that post id = 1
[DELETE]http://localhost:3456/api/posts/1 # delete a post that post id = 1
```

```ts
import {Injectable}         from '@angular2/core';
import {Response}           from '@angular2/http';
import {Http}from           '@angular2/http';

import {ActiveRecord, ApiConfig} from 'angular2-active-record';

export interface Post {
  title: string;
  content: string;
  created_at?: Date;
  status?: boolean;
}


@Injectable()
export class PostService extends ActiveRecord<Post> {
  constructor(public options: ApiConfig, public http: Http) {
    super(options, http, "posts");
  }
}

```

use `PostService` in post component:

```ts
import {Component, OnInit} from '@angular2/core';

import {MATERIAL_DIRECTIVES} from 'ng2-material/all';
import {AuthHttp, AuthConfig, tokenNotExpired, JwtHelper} from "angular2-jwt";
import {Router, RouteConfig, ROUTER_DIRECTIVES} from '@angular2/router';

import {Post} from '../models/post.model';
import {PostService} from '../services/post.service';

@Component({
  selector: 'posts',
  templateUrl: '/app/components/posts.component.html',
  directives: [MATERIAL_DIRECTIVES],
  providers: [PostService]
})

export class PostsComponent implements OnInit {
  constructor(private _postService: PostService, private _parentRouter: Router) {
  }
  errorMessage: string;
  posts: Post[];

  ngOnInit() { this.getPosts(); }

  getPosts() {
    this._postService.findAll()
      .then(
        posts => this.posts = posts
      ).catch();
  }
  updatePost(id, post: Post) {
    this._postService.update(id, {post: post}).then(
        res => {}
     ).catch();
  }
  createPost(post: Post) {
    this._postService.insert( {post: post}).then(
        res => {}
     ).catch();
  }
  showPost(id) {
    this._postService.find(id).then(
        res => {}
     ).catch();
  }
  deletePost(id) {
    this._postService.delete(id).then(
        res => {}
     ).catch();
  }
}

```

If you want to use [`angular2-jwt`](https://github.com/auth0/angular2-jwt) to authenticate after login, `post.service` same as:

```ts
@Injectable()
export class PostService extends ActiveRecord<Post> {
  constructor(public options: ApiConfig, public http: AuthHttp) {
    super(options, http, "posts");
  }
}
```

If you want to customize response data or handle error response, you must override `processData` and `handleError` in `post.service

```
  protected processData(res: Response) {
    return <T>res.json();
  }

  protected handleError(error: any): Promise<any>{
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
```

Furthermore, you can override `generateParam` function to define query params of api:

```
protected generateParam(params: any = {}): string {
    let params_arr: Array<string> = [];
    for (let key in params) {
      if (params[key]) {
        params_arr.push(key + "=" + params[key]);
      }
    }
    return "?" + params_arr.join("&");
  }
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
