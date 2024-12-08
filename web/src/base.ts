export class EventEmitter {
  callback: { [key: string]: Function[] } = {}

  asyncEmitKeys: Record<string, [number]> = {};

  on(event: string, cb: Function) {
    if (!this.callback[event]) {
      this.callback[event] = []
    }
    this.callback[event].push(cb)

    return () => {
      this.callback[event] = this.callback[event].filter(i => i !== cb)
    }
  }

  once(event: string, cb: Function) {
    const off = this.on(event, (...args: any[]) => {
      off()
      cb(...args)
    })
  }

  emit(event: string, data?: any) {
    if (this.callback[event]) {
      this.callback[event].forEach(cb => cb(data))
    }
  }

  asyncEmit(evt: string) {
    // timeout = 100
    if (this.asyncEmitKeys[evt]) {
      clearTimeout(this.asyncEmitKeys[evt][0])
    }
    // @ts-ignore
    this.asyncEmitKeys[evt] = [setTimeout(() => {
      this.emit(evt)
      delete this.asyncEmitKeys[evt]
    }, 100)]
  }

  dispose() {
    this.callback = {}
  }
}

class ApiStatus extends EventEmitter {

  status: 'loading' | 'loaded' | 'error'

  constructor() {
    super();
    this.status = 'loading';

    const interval = setInterval(() => {
      if (typeof window.pywebview !== 'undefined') {
        this.emit('loaded');
        this.status = 'loaded';
        clearInterval(interval);
      }
    }, 100);
  }

  reload() {
    this.status = 'loading';
    this.emit('loading');
    const interval = setInterval(() => {
      if (typeof window.pywebview !== 'undefined') {
        this.emit('loaded');
        this.status = 'loaded';
        clearInterval(interval);
      }
    }, 100);
  }
}

export const apiStatus = new ApiStatus()