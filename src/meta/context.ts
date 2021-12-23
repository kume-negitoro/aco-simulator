import phina from 'phina.js'

export const define = (path: string) => (_class: any) =>
    phina.register(path, (...args: unknown[]) => new _class(...args)) && _class
