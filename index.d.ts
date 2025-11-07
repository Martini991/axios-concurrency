declare module '@martini991/axios-concurrency' {
  import { AxiosInstance } from 'axios'

  export function ConcurrencyManager(
    axiosInstance: AxiosInstance, // eslint-disable-line no-unused-vars
    maxConcurrentRequests: number, // eslint-disable-line no-unused-vars
  ): {
    detach: () => void
  }
}
