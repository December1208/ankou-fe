export type AnkouConfigItem = {
    id: number
    original_key: string
    original_url: string
    original_count: number[]
    secondary_count: number[]
    difference: number
    key: string
    url: string
    ratio: number
    created_at: number
    updated_at: number
}


export type AnkouConfigList = {
    total: number
    configs: AnkouConfigItem[]

}