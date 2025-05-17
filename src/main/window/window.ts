import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

enum WindowName {
  Main = 'main'
}
type OptimaiBrowserWindowOptions = BrowserWindowConstructorOptions & {
  name?: WindowName
}

class OptimaiBrowserWindow extends BrowserWindow {
  public name: string | undefined

  constructor({ name, ...options }: OptimaiBrowserWindowOptions) {
    super(options)
    this.name = name
  }
}

export { WindowName }
export default OptimaiBrowserWindow
