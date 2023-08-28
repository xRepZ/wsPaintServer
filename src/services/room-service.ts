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
        if (canvas.length !== 2) { // 2?
            wsService.sendNewRoom(code, {figure: fig.pop()})
        } else {
            console.log("clear")
            wsService.clearRoom(code, {length: canvas.length})
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

    // getToken: async (login: string, password: string) => {
    //     const user = await db.selectOne(
    //         `select id
    //            from users
    //           where login = :login
    //             and password = :password`,
    //         {
    //             login,
    //             password: hash(password + passwordSecretKey)
    //         }
    //     )
    //     if (!user) {
    //         throw badRequest('Пользователя с такими данными не существует')
    //     }
    //     const expires = new Date()
    //     expires.setDate(expires.getDate() + 14)
    //     const tokenPayload: TokenPayload = {
    //         id: user.id as number,
    //         login,
    //         expires: +expires
    //     }
    //     const tokenPayloadString = Buffer.from(JSON.stringify(tokenPayload)).toString('base64')
    //     const sign = hash(tokenPayloadString + tokenSecretKey)
    //     return `${tokenPayloadString}.${sign}`
    // },

    // getTokenData: (token: string | undefined) => {
    //     if (!token) return null
    //     const [payloadString, sign] = token.split('.')
    //     const payload: TokenPayload = JSON.parse(Buffer.from(payloadString, 'base64').toString())
    //     if (payload.expires < +new Date()) {
    //         throw badRequest('Токен истёк')
    //     }
    //     const computedSign = hash(payloadString + tokenSecretKey)
    //     if (sign !== computedSign) {
    //         throw badRequest('Подпись токена неверна')
    //     }
    //     return payload
    // },

    // changePassword: async (userId: number, oldPassword: string, newPassword: string) => {
    //     const user = await db.selectOne(
    //         `select password
    //            from users
    //           where id = :id`,
    //         { id: userId }
    //     )
    //     if (!user) {
    //         throw badRequest('Пользователя не существует')
    //     }
    //     if (hash(oldPassword + passwordSecretKey) !== user.password) {
    //         throw badRequest('Старый пароль введён неверно')
    //     }
    //     if (oldPassword === newPassword) {
    //         throw badRequest('Новый пароль совпадает со старым')
    //     }
    //     await db.updateRow('users', {
    //         id: userId,
    //         password: hash(newPassword + passwordSecretKey)
    //     })
    //     return 'ok'
    // }
}
