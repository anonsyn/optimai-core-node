declare module 'p-queue' {
  export interface Options<QueueElementType = unknown, QueueClassOptions = unknown> {
    concurrency?: number
    intervalCap?: number
    interval?: number
    carryoverConcurrencyCount?: boolean
    timeout?: number
    throwOnTimeout?: boolean
    autoStart?: boolean
    queueClass?: new () => {
      enqueue: (value: QueueElementType, options?: QueueClassOptions) => void
      dequeue: () => QueueElementType | undefined
      size: number
    }
  }

  export default class PQueue<QueueElementType = unknown> {
    constructor(options?: Options<QueueElementType>)

    add<T>(task: () => Promise<T> | T): Promise<T>
    addAll<T>(tasks: Array<() => Promise<T> | T>): Promise<T[]>
    pause(): void
    start(): void
    clear(): void
    onIdle(): Promise<void>
    onEmpty(): Promise<void>
    get size(): number
    get pending(): number
    get isPaused(): boolean
  }
}
