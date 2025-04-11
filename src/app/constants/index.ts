// 系统配置
export const SYSTEM_CONFIG = {
    NAME: '易获客',
    VERSION: '1.0.0',
    DESCRIPTION: '客户管理系统'
};

// 分页配置
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: ['10', '20', '50', '100']
};

// API 相关配置
export const API_CONFIG = {
    TIMEOUT: 10000,  // 请求超时时间（毫秒）
    RETRY_TIMES: 3   // 请求重试次数
};

// 路由配置
export const ROUTE_CONFIG = {
    LOGIN: '/login',
    HOME: '/home',
    ACCOUNT: '/account'
};

// 用户角色
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};
