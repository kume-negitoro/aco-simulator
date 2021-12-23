export const randint = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min

export const randfloat = (min: number, max: number): number =>
    Math.random() * (max - min) + min

// 線形補間
export const linearMap = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
): number => start2 + (end2 - start2) * ((value - start1) / (end1 - start1))

// 二分探索
export const bsearch = (arr: number[], value: number): number => {
    let left = -1
    let right = arr.length

    while (right - left > 1) {
        const mid = (left + (right - left) / 2) | 0
        if (arr[mid] > value) right = mid
        else left = mid
    }

    return right
}

// 元のインデックスをルックアップテーブルとして返す降順ソート
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
