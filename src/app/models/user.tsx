export type UserBase = {
    id: string
    name: string
    role: string
}

export type AccountItem = {
    id: number;
    name: string;
    created_at: number;
    updated_at: number;
}

export type QueryParams = {
    name?: string;
    page: number;
    size: number;
}

export type NewAccountForm = {
    name: string;
    password: string;
}

export type UpdateAccountForm = {
    id: number;
    name: string;
    password: string;
}

