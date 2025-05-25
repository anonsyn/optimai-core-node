import { Observable } from 'rxjs'
import { delay, retryWhen, take } from 'rxjs/operators'

const retryAfter = (delayMs: number, maxRetries?: number) => {
  return <T>(source: Observable<T>) => {
    return source.pipe(
      retryWhen((errors) => {
        const errorPipe = maxRetries ? errors.pipe(take(maxRetries)) : errors
        return errorPipe.pipe(delay(delayMs))
      })
    )
  }
}

export { retryAfter }
