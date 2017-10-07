const emptyArray: any[] = []
const call = (f: () => void) => f()

export type TrueNode = any

export interface NodeLifeCycle<P> {
    setTrueNode(n: TrueNode): void
    props: P
    children: NodeData | NodeData[]
    refresh: (() => void)[]
    destroy: (() => void)[]
}

export type NodeLifeCycleFunc<P> = (life: NodeLifeCycle<P>) => void

export interface NodeData<P=any> {
    readonly funcID: NodeLifeCycleFunc<any>
    readonly nodeID?: any
    readonly props: P
    readonly children: NodeData | NodeData[]
}

export interface NodeOpCmd {
    readonly addChild: (n: TrueNode, index?: number) => void
    readonly remove: (n: TrueNode) => void
    readonly replace: (newN: TrueNode, oldN: TrueNode) => void
}

export const setID = (nodeID: any) => (nodeData: NodeData) => ({ ...nodeData, nodeID })

export const View = <P>(funcID: NodeLifeCycleFunc<P>) =>
    (props: P) =>
        (children: NodeData | NodeData[] = emptyArray): NodeData =>
            ({ funcID, props, children })


export const ViewF = <P>(funcID: NodeLifeCycleFunc<P>) =>
    (props: P): NodeData =>
        ({ funcID, props, children: emptyArray })

export const ViewS = (funcID: NodeLifeCycleFunc<string>): {
    (v: string): NodeData
    (v: number): NodeData
    (v: TemplateStringsArray, ...c: any[]): NodeData
} => (v: any, ...c: any[]) => {
    let props = ''
    if (typeof v == 'string') props = v
    else if (typeof v == 'number') props = String(v)
    else if (typeof v == 'object') props = String.raw(v, ...c)
    return { funcID, props, children: emptyArray }
}


export const Refresh = (life: NodeLifeCycle<any>, f: () => NodeData) => {
    const vf = view(life.setTrueNode)
    const refresh = () => vf(f())
    life.refresh.push(refresh)
    life.destroy.push(vf)
    return refresh
}


//未实现
export const view = (f?: (n: TrueNode) => void) => {

    //<----------------

    let lifeCycle: NodeLifeCycle<any> | null
    let func: NodeLifeCycleFunc<any> | null
    let node: TrueNode = null

    let ppppppp: any
    let ccccccc: NodeData | NodeData[] //


    let setTrueNode = (n: TrueNode) => {
        node = n
        if (f) f(node)
    }

    return (data?: NodeData) => {
        let nowFunc = data ? data.funcID : null

        //destroy
        if (func !== nowFunc) {
            if (lifeCycle != null) {
                lifeCycle.destroy.forEach(call)
                lifeCycle = null
            }
            node = null //<----------
            func = nowFunc
        }


        if (func != null && data != null) {


            {
                ppppppp = data.props
            }

            {
                ccccccc = data.children as NodeData | NodeData[]
            }

            //init
            if (lifeCycle == null) {
                lifeCycle = {
                    setTrueNode,
                    props: ppppppp,//<----------------
                    children: ccccccc,//<--------------
                    refresh: [],
                    destroy: []
                }
                func(lifeCycle)
            }

            lifeCycle.props = ppppppp //<------
            lifeCycle.children = ccccccc //<-------
            lifeCycle.refresh.forEach(call)
        }

    }
}


export const children = (life: NodeLifeCycle<any>, nodeOpCmd: NodeOpCmd) => {
    const vl = viewList(nodeOpCmd)
    life.refresh.push(() => vl(life.children))
    life.destroy.push(vl)
}

//未实现
export const viewList = (nodeOpCmd: NodeOpCmd) => {

    let oldArr = [] as {
        nodeData: NodeData
        node: TrueNode
        vf: (data?: NodeData) => void //<---------
    }[]


    let oldChildren: any = emptyArray
    return (children: NodeData | NodeData[] = emptyArray) => {
        if (oldChildren === children) { return }
        oldChildren = children


        let arr = (children instanceof Array) ? children : [children]

        //create new
        let newArr = arr.map(nodeData => {

            let obj = {
                node: null,
                nodeData: nodeData,
                vf: (data?: NodeData) => { }
            }

            let index = oldArr.findIndex(item => item.nodeData.funcID === nodeData.funcID)
            if (index == -1) {
                let first = true
                obj.vf = view(n => {
                    if (first) {
                        nodeOpCmd.addChild(n)
                        first = false
                    } else {
                        nodeOpCmd.replace(n, obj.node)
                    }
                    obj.node = n
                })
            } else {
                obj.vf = oldArr[index].vf
                obj.node = oldArr[index].node
                // nodeOpCmd.addChild(obj.node) //<-------!!!???!!!!
                oldArr.splice(index, 1)
            }
            obj.vf(nodeData)

            return obj
        })

        //destroy
        oldArr.forEach(v => {
            nodeOpCmd.remove(v.node)
            v.vf()
        })

        oldArr = newArr

    }
}


//___________________________DOM___________________________

export const t = ViewS(v => {
    let text = v.props
    const node = document.createTextNode(text)
    v.setTrueNode(node)
    v.refresh.push(() => { if (text != v.props) node.textContent = text = v.props })
})

export const comment = ViewS(v => {
    let text = v.props
    const node = document.createComment(text)
    v.setTrueNode(node)
    v.refresh.push(() => { if (text != v.props) node.textContent = text = v.props })
})

export const domNodeOpCmd = (node: Node) => ({
    addChild: (n: Node, index?: number) => {
        if (index == null || index == node.childNodes.length) {
            node.appendChild(n)
        } else {
            node.insertBefore(n, node.childNodes[index + 1])
        }
    },
    remove: (n: Node) => {
        node.removeChild(n)
    },
    replace: (newN: Node, oldN: Node) => {
        node.replaceChild(newN, oldN)
    }
})

export type Style = Partial<CSSStyleDeclaration> | null

const elSetStyle = (el: HTMLElement | SVGElement, newStyle: Style) => {
    el.removeAttribute('style')
    if (newStyle != null) {
        for (const k in newStyle) {
            if (newStyle[k] != null) {
                el.style[k] = newStyle[k]
            }
        }
    }
}

const diffDataSet = (el: HTMLElement | SVGElement, oldDataset: { [name: string]: string } | null, newDataset: { [name: string]: string } | null) => {

}

const diffNodeProps = (node: HTMLElement | SVGElement, oldProps: any, newProps: any) => {
    if (oldProps !== newProps) {
        for (let key in newProps) {

            const value = newProps[key]

            if (key == 'class') key = 'className'
            if (key == 'for') key = 'htmlFor'

            if (key.slice(0, 2) == 'on') {
                //diff event
                node[key] = (e: any) => value(e, node)
            } else if (key == 'style') {
                elSetStyle(node, value)
            } else if (key == 'dataset') {
                diffDataSet(node, null, value)
            } else {
                //diff attributes
                node[key] = value
            }
        }
    }
}

type D<P> = (p: P) => NodeData
type DD<P> = (p: P) => (c?: NodeData | NodeData[]) => NodeData


export let h: {
    //
    br: D<{ style?: Style, class?: string | null }>
    hr: D<{ style?: Style, class?: string | null }>
    input: D<{ autofocus?: boolean, checked?: boolean, id?: string, onclick?: (e: MouseEvent, el: HTMLInputElement) => void, onkeydown?: (e: KeyboardEvent, el: HTMLInputElement) => void, onchange?: (e: Event, el: HTMLInputElement) => void, oninput?: (e: Event, el: HTMLInputElement) => void, value?: string, placeholder?: string, style?: Style, class?: string | null, type?: string }>
    //
    body: DD<{ style?: Style, class?: string | null }>
    div: DD<{ onclick?: (e: MouseEvent, el: HTMLDivElement) => void, innerHTML?: string, style?: Style, class?: string | null }>
    canvas: DD<{ style?: Style, class?: string | null }>
    iframe: DD<{ style?: Style, class?: string | null }>
    label: DD<{ style?: Style, class?: string | null, for?: string }>
    section: DD<{ hidden?: boolean, style?: Style, class?: string | null }>
    header: DD<{ style?: Style, class?: string | null }>
    h1: DD<{ style?: Style, class?: string | null }>
    h2: DD<{ style?: Style, class?: string | null }>
    h3: DD<{ style?: Style, class?: string | null }>
    h4: DD<{ style?: Style, class?: string | null }>
    h5: DD<{ style?: Style, class?: string | null }>
    h6: DD<{ style?: Style, class?: string | null }>
    footer: DD<{ hidden?: boolean, style?: Style, class?: string | null }>
    span: DD<{ onclick?: (e: MouseEvent, el: HTMLSpanElement) => void, innerHTML?: string, style?: Style, class?: string | null }>
    ul: DD<{ style?: Style, class?: string | null }>
    li: DD<{ onclick?: (e: MouseEvent, el: HTMLLIElement) => void, style?: Style, class?: string | null | null }>
    button: DD<{ hidden?: boolean, onclick?: (e: MouseEvent, el: HTMLButtonElement) => void, style?: Style, class?: string | null }>
    a: DD<{ href?: string, style?: Style, class?: string | null }>
    p: DD<{ style?: Style, class?: string | null }>
    strong: DD<{ style?: Style, class?: string | null }>
    select: DD<{ style?: Style, class?: string | null }>
    option: DD<{ style?: Style, class?: string | null }>
} = {} as any

export const s: {
    svg: DD<{ style?: Style, class?: string | null }>
    polygon: DD<{ style?: Style, class?: string | null }>
} = {} as any

const hf = (tag: string) => ViewF(life => {
    const node = document.createElement(tag)
    life.setTrueNode(node)

    let oldProps = {} as any
    life.refresh.push(() => {
        diffNodeProps(node, oldProps, life.props)
        oldProps = life.props
    })
})

const hn = (tag: string) => View(life => {
    const node = document.createElement(tag)
    life.setTrueNode(node)


    let oldProps = {} as any
    life.refresh.push(() => {
        diffNodeProps(node, oldProps, life.props)
        oldProps = life.props
    })

    children(life, domNodeOpCmd(node))
})

const sn = (tag: string) => View(life => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag)
    life.setTrueNode(node)

    let oldProps = {} as any
    life.refresh.push(() => {
        diffNodeProps(node, oldProps, life.props)
        oldProps = life.props
    })

    children(life, domNodeOpCmd(node))
})

const __ = (dic: any, f: (s: string) => any, str: string) => str.split('|').forEach(tag => dic[tag] = f(tag))
__(h, hf, 'br|input|img|hr')
__(h, hn, 'body|div|canvas|iframe|label|section|header|h1|h2|h3|h4|h5|h6|footer|span|ul|li|button|a|p|strong|select|option')
__(s, sn, 'svg|polygon')

export const render = (node: Node, nd: NodeData) => {

    let old: Node | null = null
    let vf = view(n => {
        if (old == null) {
            node.appendChild(n)
        } else {
            node.replaceChild(n, old)
        }
        old = n
    })
    vf(nd)
    return () => vf()
}