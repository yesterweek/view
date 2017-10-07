import './index.css'

import { render, h, t, ViewF, Refresh } from './view'
import { Button } from './component/Button'
import { BlinkTest } from './component/BlinkTest'
import { Hello } from './component/Hello'

const App = ViewF(life => {

    Refresh(life, () => h.div({})([
        Hello({ text: '1234', color: 'green' }),
        Button({ text: 'hello' }),

        BlinkTest({ timeout: 500 })([
            h.h1({})(t`hello aaaaaaaaaaaaaaaaa`),
            Hello({ text: '1234', color: 'red' })
        ])
    ]))

})

render(document.body, App({}))