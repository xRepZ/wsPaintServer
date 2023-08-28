import { wsService } from "@services/ws-service"
import { IncomingMessage, Server, ServerResponse } from "http"
import { WebSocketServer } from "ws"

export const useWebsocket = (server: Server<typeof IncomingMessage, typeof ServerResponse>) => {
    const wsServer = new WebSocketServer({ server, path: '/api/ws' })
    wsServer.on('connection', wsService.onConnection)
}

