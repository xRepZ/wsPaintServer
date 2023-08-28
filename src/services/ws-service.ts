import { WebSocket } from "ws"

//const wsByUser: Record<number | string, Set<WebSocket>> = {}

const wsByRoom: Record<string, Set<WebSocket>> = {}

//const mapWsToUserId = new Map<WebSocket, number | string>()

const mapWsToRoom = new Map<WebSocket, string>()
//const wsByUser = new Map<number | string, WebSocket[] | undefined>()

const sendToAllUserConnections = (room: string, type: string, payload: unknown) => {
    for (const ws of wsByRoom[room] || []) {
        ws.send(JSON.stringify({
            type,
            payload
        }))
    }
}

export const wsService = {
    onConnection: (ws: WebSocket) => {
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
        // ws.on('ping', (message) => {
        //     console.log('got ping')
        //     ws.send('pong ' + message.toString())
        // })
        ws.onmessage = (event) => {
            // console.log(event.type)
            // console.log("send")
            // console.log(event)
            const { type, payload } = JSON.parse(event.data.toString())
            if (type === 'init') {
                console.log("init")

                console.log(payload)
                const room = payload
                //const room = JSON.parse(Buffer.from(payload.split('.')[0], 'base64').toString())
                //const id = user.id as number
                if (!wsByRoom[room]) {
                    wsByRoom[room] = new Set()
                }

                const arr = wsByRoom[room]
                if (!arr.has(ws)) {
                    arr.add(ws)
                }
                
                console.log('clients: ', arr.size)
                // arr.forEach(client => {
                //     client.send(JSON.stringify({ type: "server log" }))
                // })

              

                mapWsToRoom.set(ws, room)
        

            } else if (type === 'update_room') {
                //console.log("move")
                //console.log(payload)
                //console.log(payload)

                sendToAllUserConnections(payload.room, type, payload)
            }
            // ws.send(event.data.toString().toUpperCase())
        }
        ws.onclose = (event) => {
            const room = mapWsToRoom.get(ws) as string
            mapWsToRoom.delete(ws)
            wsByRoom[room].delete(ws)
            console.log('closed')
            clearInterval(pingInterval)
        }
        ws.onerror = (event) => {
            console.log('error:', event.error)
        }
    },
    sendNewRoom: (room: string, payload: unknown) => {
        sendToAllUserConnections(room, 'update_room', payload)
    },
    clearRoom: (room: string, payload: unknown) => {
        sendToAllUserConnections(room, 'clear_room', payload)
    }
    // deleteTodo: (userId: number, payload: unknown) => {
    //     sendToAllUserConnections(userId, 'delete_todo', payload)
    // },
    // deleteDone: (userId: number, payload: unknown) => {
    //     sendToAllUserConnections(userId, 'delete_done', payload)
    // },
    // deleteAll: (userId: number, payload: unknown) => {
    //     sendToAllUserConnections(userId, 'delete_all', payload)
    // },
    // editTodo: (userId: number, payload: unknown) => {
    //     sendToAllUserConnections(userId, 'edit', payload)
    // },
    // moveToDone: (userId: number, payload: unknown) => {
    //     sendToAllUserConnections(userId, 'move_to_done', payload)
    // },
    // moveToActual: (userId: number, payload: unknown) => {
    //     sendToAllUserConnections(userId, 'move_to_actual', payload)
    // },
}
