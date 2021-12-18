import { define, linearMap } from 'utils/util'
import { width, height } from 'meta/config'
import { ACOSimulator, Node } from 'utils/ACO'

const fix = (x: number): number => linearMap(x, 0, 100, 0, 480)

@define('MainScene')
export class MainScene extends DisplayScene {
    protected updateInterval = 100
    protected elapsedTime = 0
    protected step = 1
    protected maxStep = 120
    protected simulator
    protected plain

    constructor() {
        super({
            width,
            height,
        })

        this.backgroundColor = 'white'

        const nodeNum = 28

        const nodes = Array.from<unknown, Node>(
            Array(nodeNum),
            (_, i) => new Node(Math.randint(0, 100), Math.randint(0, 100), i)
        )

        const edges = Array.from<unknown, number[]>(Array(nodeNum), (_, i) =>
            Array.from<unknown, number>(Array(nodeNum), (_, j) =>
                i === j ? -1 : 0.01
            )
        )

        console.log(nodes.length)
        console.table(edges)

        const simulator = new ACOSimulator({
            alpha: 1.5,
            beta: 2.0,
            rho: 0.5,
            nodes,
            edges,
        })

        this.simulator = simulator

        this.plain = new PlainElement({
            width: 480,
            height: 480,
        })
            .setOrigin(0, 0)
            .setPosition(0, 0)
            .addChildTo(this)
    }

    update(app: GameApp): void {
        this.elapsedTime += app.deltaTime
        if (this.elapsedTime >= this.updateInterval) {
            if (this.step > this.maxStep) return

            console.log(`step ${this.step}`)
            // return
            const {
                value: { dist, path },
            } = this.simulator.next()
            this.elapsedTime = 0

            console.log({ dist })

            const nodes = this.simulator.getNodes()
            const edges = this.simulator.getEdges()

            const canvas = this.plain.canvas
            const ctx = canvas.context
            ctx.clearRect(0, 0, 480, 480)
            for (let i = 0; i < path.length - 1; i++) {
                const ii = path[i]
                const ij = path[i + 1]
                ctx.lineWidth = 1
                ctx.strokeStyle = `rgba(0, 0, 255, ${Math.min(
                    edges[ii][ij] * 100,
                    255
                )})`
                canvas.drawLine(
                    fix(nodes[ii].x),
                    fix(nodes[ii].y),
                    fix(nodes[ij].x),
                    fix(nodes[ij].y)
                )
            }
            canvas.drawLine(
                fix(nodes[path[0]].x),
                fix(nodes[path[0]].y),
                fix(nodes[path[path.length - 1]].x),
                fix(nodes[path[path.length - 1]].y)
            )

            for (const { x, y } of nodes) {
                ctx.strokeStyle = 'red'
                canvas.drawPoint(fix(x), fix(y))
            }

            this.step += 1
        }
    }
}
