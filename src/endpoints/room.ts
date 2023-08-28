import { jsonHandler } from "@help/decorators"
import { roomService } from "@services/room-service"
import { badRequest } from "@help/errors"
import { SQL } from "pg-sql/build/sql"

export default {
    post: jsonHandler(async ({ payload }) => {
        return await roomService.createRoom()
    }),
    put: jsonHandler(async ({ payload }) => {
        return await roomService.putCanvas(payload.code as string, payload.canvas as string)
    }),
    get: jsonHandler(async ({ params }) => {
        if (!params.code) {
            throw badRequest()
        }
        return await roomService.getCanvas(params.code as string)
    })
} as Endpoint





