# Axios Concurrency Manager

> **Note:** This repository is a fork of [bernawil/axios-concurrency](https://github.com/bernawil/axios-concurrency).
> It may include modifications, updates, or maintenance improvements not present in the original version.

Get control of concurrent requests of any [axios](https://github.com/axios/axios) instance.
Implemented using axios interceptors.

## Installing

```shell
npm install @martini991/axios-concurrency
```

## Example

```js
import axios from 'axios'
import { ConcurrencyManager } from 'axios-concurrency'

const api = axios.create({
  baseURL: 'http://mypublicapi.com',
})

const MAX_CONCURRENT_REQUESTS = 5 // a concurrency parameter of 1 makes all api requests sequential
const manager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS) // init concurrency manager

// requests will be sent in batches determined by MAX_CONCURRENT_REQUESTS
Promise.all(manyIds.map((id) => api.get(`/test/${id}`))).then((responses) => {
  // ...
})

manager.detach() // to stop using the concurrency manager ejecting the request and response handlers from your axios instance
```

## License

MIT
