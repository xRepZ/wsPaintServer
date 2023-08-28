import { IncomingMessage } from "http"

export const split = (s: string, d: string) => {
    const eqIdx = s.indexOf(d)
    if (eqIdx === -1) {
        return [s, '']
    }
    const k = s.slice(0, eqIdx)
    const v = s.slice(eqIdx + 1)
    return [k, v]
}

export const parseQueryString = (s?: string): QueryParams => {
    if (!s) return {}
    const params: QueryParams = {}
    for (const part of s.split('&')) {
        const [k, v] = split(part, '=')
        const dv = decodeURIComponent(v)
        if (k.endsWith('[]')) {
            const key = k.slice(0, -2)
            if (key in params) {
                (params[key] as string[]).push(dv)
            }
            else {
                params[key] = [dv]
            }
        }
        else {
            params[k] = dv
        }
    }
    return params
}

export const readBody = (req: IncomingMessage): Promise<Buffer> => {
    const parts: Uint8Array[] = []
    return new Promise((resolve) => {
        req.on('data', (chunk) => {
            parts.push(chunk)
        }).on('end', () => {
            resolve(Buffer.concat(parts))
        })
    })
}
