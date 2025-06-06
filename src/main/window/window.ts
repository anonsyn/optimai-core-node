import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

enum WindowType {
  CoreNode = 'main',
  LiteNode = 'lite-node'
}
type OptimaiBrowserWindowOptions = BrowserWindowConstructorOptions & {
  type: WindowType
}

class OptimaiBrowserWindow extends BrowserWindow {
  public type: WindowType

  constructor({ type, ...options }: OptimaiBrowserWindowOptions) {
    super(options)
    this.type = type
  }
}

export { WindowType }
export default OptimaiBrowserWindow
