import { ViewF, h, t, Refresh } from '../view'

import './Hello.css'

export type HelloProps = {
    text: string
    color: string
}

export const Hello = ViewF<HelloProps>(life => {

    Refresh(life, () =>
        h.h1({ style: { color: life.props.color } })(t(life.props.text))
    )

})