export class HttpError extends Error {
    public readonly status: number
    public readonly parentError?: Error
    constructor(status: number, message: string, parentError?: Error) {
        super(message)
        this.status = status
        this.parentError = parentError
    }
}

export const badRequest = (message?: string) => new HttpError(400, message || 'Bad Request')
export const unauthorized = (message?: string) => new HttpError(401, message || 'Unauthorized')
export const notFound = (message?: string) => new HttpError(404, message || 'Not Found')
export const methodNotAllowed = (message?: string) => new HttpError(405, message || 'Method Not Allowed')
export const serverError = (message?: string, error?: Error) => new HttpError(500, message || 'Internal Server Error', error)
