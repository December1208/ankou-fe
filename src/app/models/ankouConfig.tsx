export type AnkouConfigItem = {
    id: number
    original_key: string
    original_url: string
    original_count: UVData[]
    secondary_count: UVData[]
    difference: number
    key: string
    url: string
    ratio: number
    start_at: number
    end_at: number
    created_at: number
    updated_at: number
}


export type UVData = {
    key: string
    date: string
    count: number
}


export type AnkouConfigList = {
    total: number
    configs: AnkouConfigItem[]

}


export type ConfigStatisticsItem = {
    key: string
    total: number
    uv: UVData[]
}

export type ConfigStatistics = {
    uv: ConfigStatisticsItem[]
}