import { parseQueryString, readBody, split } from '@help/utils'
import { basePathUrl } from 'env'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { useWebsocket } from './websocket'

async function* walk(dir: string): AsyncGenerator<string> {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = `${dir}/${d.name}`
        if (d.isDirectory()) {
            yield* walk(entry)
        } else if (d.isFile()) {
            yield entry
        }
    }
}

const notFoundHandler: Handler = async () => {
    return {
        status: 404,
        headers: {},
        body: JSON.stringify({
            status: 'error',
            payload: 'Not found'
        })
    }
}

const main = async () => {
    const endpoints: Record<string, Endpoint> = {}
    const epPath = path.join(__dirname, 'endpoints')
    for await (let p of walk(epPath)) {
        p = p.replace(/\.[^.]+$/, '')
        const url = p.replace(epPath + '/', '')
        endpoints[url] = (await import(p)).default
    }

    const server = http.createServer(async (req, res) => {
        if (!req.url || !req.method) {
            res.end()
            return
        }
        const method = req.method.toLowerCase() as HttpMethod
        const headers = req.headers as Record<string, string>
        const [url, queryString = ''] = split(req.url.slice(basePathUrl.length), '?')
        const params = parseQueryString(queryString)
        const body = await readBody(req)

        const ep = endpoints[url]
        const handler = ep && ep[method] || notFoundHandler
        const resp = await handler({
            params,
            body,
            headers,
            method
        })

        res.statusCode = resp.status
        for (const [k, v] of Object.entries(resp.headers)) {
            res.setHeader(k, v)
        }
        res.write(resp.body)
        res.end()
    })
    server.addListener('upgrade', (req, socket, head) => {
        console.log('UPGRADE')
    })
    useWebsocket(server)
    server.listen(3000)
    console.log('Listening on port 3000')
}
main()
