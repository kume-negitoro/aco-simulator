import fs from 'fs/promises'
import path from 'path'
import { createCanvas, Canvas } from 'canvas'
import { ACOSimulator, Node } from 'utils/ACO'
import { linearMap } from 'utils/util'

process.on('unhandledRejection', (err) => console.error(err))

const nodeListType = 2
const nodeListCsvPath = `./data/node-list-type${nodeListType}.csv`
const destPath = './out'

const simulatorNum = 20
const maxStep = 20
const alpha = 1.5
const beta = 2
const rho = 0.5
const tau0 = 0.01

const sampleStep = 5

const nodeRange = 100
const canvasSize = 480
const pointSize = 2

const drawFigure = (
    nodes: readonly Node[],
    edges: readonly number[][],
    path: readonly number[],
    fix = (n: number) => n
): Canvas => {
    const canvas = createCanvas(canvasSize, canvasSize)
    const ctx = canvas.getContext('2d')

    // パスの描画
    for (let i = 0; i < path.length - 1; i++) {
        const ii = path[i]
        const ij = path[i + 1]
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(0, 0, 255, ${Math.max(
            0,
            Math.min(edges[ii][ij] * 100, 255)
        )})`
        ctx.beginPath()
        ctx.moveTo(fix(nodes[ii].x), fix(nodes[ii].y))
        ctx.lineTo(fix(nodes[ij].x), fix(nodes[ij].y))
        ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(fix(nodes[path[0]].x), fix(nodes[path[0]].y))
    ctx.lineTo(
        fix(nodes[path[path.length - 1]].x),
        fix(nodes[path[path.length - 1]].y)
    )
    ctx.stroke()

    ctx.beginPath()
    // 点の描画
    ctx.strokeStyle = 'red'
    for (const { x, y } of nodes) {
        // ctx.beginPath()
        ctx.strokeRect(fix(x), fix(y), pointSize, pointSize)
        ctx.stroke()
    }

    return canvas
}

const saveFigure = async (canvas: Canvas, name: string): Promise<void> => {
    const base64 = canvas.toDataURL().split(',')[1]
    const buffer = Buffer.from(base64, 'base64')
    await fs.writeFile(path.join(destPath, `${name}.png`), buffer)
}

const main = async (): Promise<void> => {
    const csv = await fs.readFile(nodeListCsvPath, 'utf-8')

    const nodes = csv
        .trim()
        .split('\n')
        .map((row, i) => {
            const [x, y] = row.split(',')
            return new Node(+x, +y, i)
        })

    const edges = Array.from<unknown, number[]>(Array(nodes.length), (_, i) =>
        Array.from<unknown, number>(Array(nodes.length), (_, j) =>
            i === j ? -1 : 0.01
        )
    )

    const simulators = Array.from<unknown, ACOSimulator>(
        Array(simulatorNum),
        () =>
            new ACOSimulator({
                alpha,
                beta,
                rho,
                tau0,
                nodes,
                edges,
            })
    )

    const fix = (x: number): number => linearMap(x, 0, nodeRange, 0, canvasSize)

    console.log('--- start simulation ---')
    fs.writeFile(
        path.join(
            destPath,
            `type=${nodeListType},alpha=${alpha},beta=${beta},rho=${rho},tau0=${tau0}.csv`
        ),
        ''
    )
    for (let step = 1; step <= maxStep; step++) {
        const results = simulators.map((sim) => sim.next())

        const edges = simulators[0].getEdges()
        const dist = results[0].value.dist
        const apath = results[0].value.path

        console.log(`step=${step}, dist=${dist}`)

        // 図の出力
        if (step === 1 || step % sampleStep === 0) {
            const fig = drawFigure(nodes, edges, apath, fix)
            await saveFigure(
                fig,
                `type=${nodeListType},step=${step},alpha=${alpha},beta=${beta},rho=${rho},tau0=${tau0}`
            )
        }

        // CSV追記
        fs.appendFile(
            path.join(
                destPath,
                `type=${nodeListType},alpha=${alpha},beta=${beta},rho=${rho},tau0=${tau0}.csv`
            ),
            `${results.map((r) => r.value.dist).join(',')}\n`
        )
    }

    console.log('--- end simulation ---')
}

main()
