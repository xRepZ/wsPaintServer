import { mysqlOptions } from 'env'
import mysql from 'mysql2'


import { serverError } from '@help/errors'


const pool = mysql.createPool(mysqlOptions)


const queryFormat = (query: string, params?: Record<string, unknown>) => {
    if (!params) return query
    return query.replace(/:(\w+)/g, (_, key) => {
        if (key in params) {
            return mysql.escape(params[key])
        }
        throw serverError()
    })
}

/*
query = 'insert into users (login, password) values (:login, :password)'
params = { login: 'test', password: 'asdasd' }

return "insert into users (login, password) values ('test', 'asdasd')"
*/

type MysqlResult = mysql.RowDataPacket[]
    | mysql.OkPacket

const query = <T extends MysqlResult>(sql: string, params?: Record<string, unknown>) => {
    return new Promise<T>((resolve, reject) => {
        pool.query<T>(queryFormat(sql, params), (error, results) => {
            if (error) reject(serverError(error.message, error))
            resolve(results)
        })
    })
}

const selectAll: (sql: string, params?: Record<string, unknown>) => Promise<Record<string, unknown>[]> = async (sql, params) => {
    return await query<mysql.RowDataPacket[]>(sql, params)
}
const selectOne: (sql: string, params?: Record<string, unknown>) => Promise<Record<string, unknown> | null> = async (sql, params) => {
    return (await query<mysql.RowDataPacket[]>(sql, params))[0] || null
}

type InsertOptions = {
    mode: 'default' | 'ignore' | 'update',
    onDupKeyUpdate?: string
}
const insert: (table: string, params: Record<string, unknown>, options?: InsertOptions) => Promise<number> = async (table, params, options) => {
    const { mode = 'default', onDupKeyUpdate } = options || {}
    const keys = Object.keys(params)
    const sql = `insert${mode === 'ignore' ? ' ignore' : ''} into ${table}` +
        ` (${keys.join(',')}) values (:${keys.join(',:')})` +
        (onDupKeyUpdate ? ` on duplicate key update ${onDupKeyUpdate}` : '')
    const results = await query<mysql.OkPacket>(sql, params)
    return results.insertId
}

const updateRow: (table: string, params: Record<string, unknown>) => Promise<void> = async (table, params) => {
    const set = Object.keys(params).filter(p => p !== 'id').map(p => `${p}=:${p}`)
    const sql = `update ${table} set ${set} where id = :id`
    await query<mysql.OkPacket>(sql, params)
}

const deleteRow: (table: string, id: number | string) => Promise<void> = async (table, id) => {
    const sql = `delete from ${table} where id = :id`
    await query<mysql.OkPacket>(sql, { id })
}

const closePool = () => {
    pool.end()
}

export const db = {
    query,
    selectAll,
    selectOne,
    insert,
    updateRow,
    deleteRow
}

process.on('exit', closePool)
/*
update <table>
   set <filld_name> = <field_value>
      ,<filld_name> = <field_value>
      ,<filld_name> = <field_value>
 where <condition>
*/