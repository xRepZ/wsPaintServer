type QueryParams = Record<string, string | string[]>

type HttpMethod = 'get' | 'post' | 'put' | 'delete'

type HttpRequest = {
    params: QueryParams,
    body: Buffer,
    headers: Record<string, string>,
    method: HttpMethod
}

type HttpResponse = {
    status: number,
    headers: Record<string, string>,
    body: unknown
}

type Handler = (req: HttpRequest) => Promise<HttpResponse>

type Endpoint = Record<HttpMethod, Handler>
