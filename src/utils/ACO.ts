import { randint, randfloat, bsearch, sortWithIndicies } from './util'

export class Node {
    constructor(public x: number, public y: number, public key: number) {}
    static distance(a: Node, b: Node): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    }
}

export interface AntProps {
    nodes: Node[]
    edges: number[][]
    alpha: number
    beta: number
    startPosition: number
}

export class Ant {
    protected nodes: Node[]
    protected edges: number[][]
    protected tabuList: number[]
    protected position: number
    protected alpha: number
    protected beta: number
    protected distance: number

    constructor({ nodes, edges, alpha, beta, startPosition }: AntProps) {
        this.nodes = nodes
        this.edges = edges
        this.alpha = alpha
        this.beta = beta
        this.distance = 0
        this.position = startPosition
        this.tabuList = [startPosition]
    }

    reset(startPosition: number, edges: number[][]): void {
        this.distance = 0
        this.position = startPosition
        this.tabuList = [startPosition]
        this.edges = edges
    }

    next(): { value: { dist: number; path: number[] }; done: boolean } {
        const { nodes, edges, position: j, alpha, beta } = this

        // \sigma_{l \notin L_{T}} \tau^{\alpha}_{lj} \eta^{\beta}_{lj}
        const sigma = this.nodes.reduce((acc, node, l) => {
            if (this.tabuList.some((t) => t === l)) return acc
            const eta = 1 / Node.distance(nodes[j], nodes[l])
            return acc + Math.pow(edges[l][j], alpha) * Math.pow(eta, beta)
        }, 0)

        // 全ノードがタブーリストに入っていた場合
        if (this.tabuList.length === this.nodes.length) {
            // すでに初期位置に戻っていた場合
            if (this.position === this.tabuList[0]) {
                return {
                    value: { dist: this.distance, path: this.tabuList },
                    done: true,
                }
            }

            // 最後に初期位置に戻り、総距離を返す
            const pos = (this.position = this.tabuList[0])
            this.distance += Node.distance(nodes[j], nodes[pos])
            return {
                value: { dist: this.distance, path: this.tabuList },
                done: false,
            }
        }

        // 次のノードの選択確率を計算
        const ps = this.nodes.map((node, i) => {
            if (this.tabuList.some((t) => t === i)) return 0
            const eta = 1 / Node.distance(nodes[j], nodes[i])
            return (Math.pow(edges[i][j], alpha) * Math.pow(eta, beta)) / sigma
        })

        // インデックスを保持して選択確率をソート
        const [descps, slut] = sortWithIndicies(ps)
        const accps: number[] = []
        const nps = []
        const lut = []
        for (let i = 0; i < descps.length; i++) {
            // タブーリストに含まれていないものを抽出
            if (!this.tabuList.includes(slut[i])) {
                lut.push(i)
                nps.push(descps[i])
                accps.push((accps[accps.length - 1] || 0) + descps[i])
            }
        }

        // 選択確率と乱数に基づいて次のノードを決定
        const rand = randfloat(0, 1)
        const i = Math.min(bsearch(accps, rand), accps.length - 1)
        this.tabuList.push(slut[lut[i]])
        this.position = slut[lut[i]]
        this.distance += Node.distance(nodes[j], nodes[slut[lut[i]]])

        return {
            value: { dist: this.distance, path: this.tabuList },
            done: false,
        }
    }
}

interface ACOSimulatorProps {
    nodes: Node[]
    edges: number[][]
    nAnts?: number
    alpha?: number
    beta?: number
    rho?: number
    tau0?: number
}

export class ACOSimulator {
    protected ants: Ant[]
    protected nNodes: number

    protected nodes: Node[]
    protected edges: number[][]
    protected nAnts: number
    protected alpha: number
    protected beta: number
    protected rho: number
    protected tau0: number

    constructor({
        nodes,
        edges,
        nAnts = 20,
        alpha = 1.5,
        beta = 2.0,
        rho = 0.5,
        tau0 = 0,
    }: ACOSimulatorProps) {
        this.nodes = nodes
        this.edges = edges
        this.nAnts = nAnts
        this.alpha = alpha
        this.beta = beta
        this.rho = rho
        this.tau0 = tau0

        const nNodes = (this.nNodes = nodes.length)

        this.ants = Array.from(
            Array(nAnts),
            () =>
                new Ant({
                    nodes,
                    edges,
                    alpha,
                    beta,
                    startPosition: randint(0, nNodes - 1),
                })
        )
    }

    resetAnts(newEdge: number[][]): void {
        for (const ant of this.ants) {
            ant.reset(randint(0, this.nNodes - 1), newEdge)
        }
    }

    next(): { value: { dist: number; path: number[] }; done: boolean } {
        const { nNodes, edges, rho } = this

        let bestIndex = -1
        let bestDist = Infinity
        const results = this.ants.map((ant, i) => {
            let result = ant.next()
            while (!result.done) {
                result = ant.next()
            }
            if (result.value.dist < bestDist) {
                bestIndex = i
                bestDist = result.value.dist
            }
            return result.value
        })

        const newEdges = Array.from<unknown, number[]>(Array(nNodes), () =>
            Array.from(Array(nNodes), () => 0)
        )
        const delta = Array.from<unknown, number[]>(Array(nNodes), () =>
            Array.from(Array(nNodes), () => 0)
        )

        for (const { dist, path } of results) {
            for (let i = 0; i < path.length - 1; i++) {
                const ii = path[i]
                const ij = path[i + 1]
                delta[ii][ij] += 1 / dist
                delta[ij][ii] += 1 / dist
            }
            const ii = path[0]
            const ij = path[path.length - 1]
            delta[ij][ii] += 1 / dist
            delta[ii][ij] += 1 / dist
        }

        for (const { path } of results) {
            for (let i = 0; i < path.length - 1; i++) {
                const ii = path[i]
                const ij = path[i + 1]
                newEdges[ii][ij] += (1 - rho) * edges[ii][ij] + delta[ii][ij]
                newEdges[ij][ii] += (1 - rho) * edges[ii][ij] + delta[ii][ij]
            }
            const ii = path[0]
            const ij = path[path.length - 1]
            newEdges[ij][ii] += (1 - rho) * edges[ij][ii] + delta[ij][ii]
            newEdges[ii][ij] += (1 - rho) * edges[ij][ii] + delta[ij][ii]
        }

        this.resetAnts(newEdges)

        return {
            value: {
                dist: results[bestIndex].dist,
                path: results[bestIndex].path,
            },
            done: false,
        }
    }

    getNodes(): Node[] {
        return this.nodes
    }

    getEdges(): number[][] {
        return this.edges
    }
}
