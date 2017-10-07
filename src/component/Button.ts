import { ViewF, h, t, Refresh } from '../view'

import './Button.css'

export type ButtonProps = {
    text: string
}

export const Button = ViewF<ButtonProps>(life => {


    let ripple = {
        class: 'ripple',
        style: {
            width: '',
            height: '',
            top: '',
            left: ''
        }
    }


    const btn = h.button({
        class: 'button',
        onclick: (e, el) => {
            e.stopPropagation()
            const rect = el.getBoundingClientRect()
            const radius = Math.max(rect.width, rect.height)

            ripple = { ...ripple, class: 'ripple' }
            refresh()

            ripple = {
                class: 'ripple show',
                style: {
                    width: radius + 'px',
                    height: radius + 'px',
                    top: (e.pageY - rect.top - radius / 2 - document.body.scrollTop) + 'px',
                    left: (e.pageX - rect.left - radius / 2 - document.body.scrollLeft) + 'px'
                }
            }
            refresh()
        }
    })


    const refresh = Refresh(life, () =>
        btn([
            t(life.props.text),
            h.div(ripple)()
        ])
    )
})