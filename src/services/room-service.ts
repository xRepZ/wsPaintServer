import { HttpError, serverError, notFound, badRequest } from "@help/errors"
import { db } from "./db-service"
import { wsService } from "./ws-service"

// const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

// const getRandomArbitrary = (min : number, max : number) => {
//     return Math.floor(Math.random() * (max - min) + min)
// }

// const generateCode = () => {
//     let code = ''
//     for (let i = 0; i < 8; i++) {
//         code += alphabet[getRandomArbitrary(0, alphabet.length-1)]
//     }
//     return code
// }

export type RoomPayload = {
    code: string
}

const getRoomCode = () => {
    const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: 8 }, () => alpha[Math.floor(Math.random() * alpha.length)]).join('')
}


export const roomService = {
    createRoom: async () => {
        while (true) {
            try {
                const code = getRoomCode()
               
                await db.insert('rooms', {
                    code,
                    canvas: '[]'
                })
                return code
            }
            catch (e) { }
        }
    },
    putCanvas: async (code: string, canvas: string) => {

        const fig = JSON.parse(canvas)
        //console.log(arr.pop())

        await db.query(
            `update rooms
                set canvas = :canvas
              where code = :code`,
            { code, canvas }
        )
        console.log("len", canvas.length)
        if (canvas === '[]') {
            console.log("clear")
            wsService.clearRoom(code, {length: canvas.length})
        }
        else {
            //console.log("type", fig)
            const lastFig = fig.pop()
            // if (lastFig.type === "image") {
            //     // console.log("image", lastFig.image)
            //     //wsService.saveCanvasImage(code, {figure: lastFig})
                
            // } else {
                console.log("canvas")
                wsService.sendNewCanvas(code, {figure: lastFig})
            //}
            
        }
    },
    getCanvas: async (code: string) => {
        const canvas = await db.selectOne(
            `select canvas
               from rooms
              where code = :code`,
            { code }
        )
        if (!canvas) {
            throw notFound('Комната не найдена')
        }
        return canvas
    },
}
