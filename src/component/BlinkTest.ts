import { View, h, comment, Refresh } from '../view'


const getRandomColor = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16)


export type BlinkTestProps = {
    timeout: number
}

export const BlinkTest = View<BlinkTestProps>(life => {

    let c = 0

    const refresh = Refresh(life, () =>
        ++c % 2 == 0 ?
            comment('')
            :
            h.div({ style: { color: getRandomColor() } })(life.children)
    )

    const timer = setInterval(refresh, life.props.timeout)
    life.destroy.push(() => clearInterval(timer))
})