import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

enum WindowType {
  CoreNode = 'main'
}
type OptimaiBrowserWindowOptions = BrowserWindowConstructorOptions & {
  windowType: WindowType
}

class OptimaiBrowserWindow extends BrowserWindow {
  public windowType: WindowType

  constructor({ windowType, ...options }: OptimaiBrowserWindowOptions) {
    super(options)
    this.windowType = windowType
  }
}

export { WindowType }
export default OptimaiBrowserWindow
