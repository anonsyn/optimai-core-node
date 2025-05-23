const DEFAULT_PORT = 9009

class Node {
  public _port: number

  constructor() {
    this._port = DEFAULT_PORT
  }
}

const node = new Node()

export { node }
