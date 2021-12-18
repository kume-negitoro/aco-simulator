import phina from 'phina.js'

export const define = (path: string) => (_class: any) =>
    phina.register(path, (...args: unknown[]) => new _class(...args)) && _class

export const linearMap = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
): number => start2 + (end2 - start2) * ((value - start1) / (end1 - start1))

export const bsearch = (arr: number[], value: number): number => {
    let imin = 0
    let imax = arr.length
    let index = ((imin + imax) / 2) | 0
    while (imax !== index && imin !== index) {
        if (arr[index] < value) {
            imin = index
        } else {
            imax = index
        }
        index = ((imin + imax) / 2) | 0
    }
    return index
}

export const sortWithIndicies = (arr: number[]): [number[], number[]] => {
    const xs = arr.map((v, i) => [v, i])
    xs.sort((a, b) => b[0] - a[0])
    const ys = []
    const idx = []
    for (const [v, i] of xs) {
        ys.push(v)
        idx.push(i)
    }
    return [ys, idx]
}
