import 'phina-patch-es-classes-support'
import phina from 'phina.js'
phina.globalize()

import { width, height } from 'meta/config'
import 'scenes/MainScene.ts'

phina.main(() => {
    const app = GameApp({
        width,
        height,
        fps: 60,
        startLabel: 'main',
    })

    app.enableStats()

    app.run()
})
