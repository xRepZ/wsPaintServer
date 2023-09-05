import { WebSocket } from "ws"

//const wsByUser: Record<number | string, Set<WebSocket>> = {}

const wsByRoom: Record<string, Set<WebSocket>> = {}

//const mapWsToUserId = new Map<WebSocket, number | string>()

//const wsByUser = new Map<number | string, WebSocket[] | undefined>()

const sendToAllUserConnections = (room: string, type: string, payload: unknown) => {
    for (const ws of wsByRoom[room] || []) {
        ws.send(JSON.stringify({
            type,
            payload
        }))
    }
}
const sendToAllExceptMe = (room: string, myWs: WebSocket, type: string, payload: unknown) => {
    for (const ws of wsByRoom[room] || []) {
        if (ws === myWs) continue
        ws.send(JSON.stringify({
            type,
            payload
        }))
    }
}

let id = 0

export const wsService = {
    onConnection: (ws: WebSocket) => {
        let room: string
        console.log('connected')
        const pingInterval = setInterval(() => {
            console.log('ping sent')
            ws.ping()
        }, 15000)
        let closeTimer: ReturnType<typeof setTimeout>
        ws.on('pong', () => {
            console.log('pong received')
            clearTimeout(closeTimer)
            closeTimer = setTimeout(() => {
                ws.close()
            }, 30000)
        })

        ws.onmessage = (event) => {

            const { type, payload } = JSON.parse(event.data.toString())
            if (type === 'init') {
                console.log("init")

                console.log(payload)
                room = payload

                if (!wsByRoom[room]) {
                    wsByRoom[room] = new Set()
                }

                const arr = wsByRoom[room]
                if (!arr.has(ws)) {
                    arr.add(ws)
                }

                console.log('clients: ', arr.size)

                ws.send(JSON.stringify({
                    type: 'connected',
                    payload: ++id
                }))
            } else if (type === 'update_room') {
                sendToAllUserConnections(payload.room, type, payload)
            } else if (type === 'drawing_figure') {
                sendToAllExceptMe(room, ws, type, payload)
            } else if (type === 'saved_canvas') {
                console.log("send")
                sendToAllExceptMe(room, ws, type, payload)
            }
            
        }
        ws.onclose = (event) => {
            wsByRoom[room].delete(ws)
            console.log('closed')
            clearInterval(pingInterval)
        }
        ws.onerror = (event) => {
            console.log('error:', event.error)
        }
    },
    sendNewCanvas: (room: string, payload: unknown) => {
        sendToAllUserConnections(room, 'update_room', payload)
    },

    clearRoom: (room: string, payload: unknown) => {
        sendToAllUserConnections(room, 'clear_room', payload)
    }
}
