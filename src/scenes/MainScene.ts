import { define } from 'utils/util'
import { width, height } from 'meta/config'

@define('MainScene')
export class MainScene extends DisplayScene {
    constructor() {
        super({
            width,
            height,
        })
    }
}
