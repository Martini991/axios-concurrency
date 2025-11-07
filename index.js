class RequestsQueue {
  static DEFAULT_MAX_CONCURRENT_REQUESTS = 10

  constructor(maxConcurrentRequests = RequestsQueue.DEFAULT_MAX_CONCURRENT_REQUESTS) {
    if (maxConcurrentRequests < 1) throw new Error('Error: RequestsQueue minimum maxConcurrentRequests is 1')

    this.maxConcurrentRequests = maxConcurrentRequests

    this.queue = []
    this.running = 0
  }

  tryRunNext = () => {
    if (this.running >= this.maxConcurrentRequests) return

    const request = this.queue.shift()
    if (request === undefined) return

    if (this.isCanceled(request)) {
      this.tryRunNext()
      return
    }

    request.resolve(request.config)
    this.running++
  }

  isCanceled = (request) => Boolean(request.config.cancelToken?.reason || request.config.signal?.aborted)

  enqueue = (config) => {
    return new Promise((resolve) => {
      this.queue.push({ config, resolve })
      setTimeout(() => this.tryRunNext(), 0)
    })
  }

  onFinished = (result) => {
    this.running--
    this.tryRunNext()
    return result
  }
}

export function ConcurrencyManager(axios, MAX_CONCURRENT) {
  const requestsQueue = new RequestsQueue(MAX_CONCURRENT)

  const instance = {
    interceptors: {
      request: axios.interceptors.request.use(requestsQueue.enqueueRequest),
      response: axios.interceptors.response.use(
        (response) => requestsQueue.onFinished(response),
        (error) => Promise.reject(requestsQueue.onFinished(error)),
      ),
    },
    detach: () => {
      axios.interceptors.request.eject(instance.interceptors.request)
      axios.interceptors.response.eject(instance.interceptors.response)
    },
  }

  return instance
}
