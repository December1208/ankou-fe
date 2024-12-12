import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { UserBase } from "../app/models/user";


interface CommonResponse<dataT = never> {
  code: number;
  data: dataT;
  success: boolean;
  msg: string;
}

export class APIError {
  readonly request: { url?: string; data: unknown };
  readonly resp: CommonResponse;

  constructor(request: APIError['request'], resp: APIError['resp']) {
    this.request = Object.freeze({ ...request });
    this.resp = Object.freeze({ ...resp });
  }
  toString(): string {
    return this.resp.msg;
  }
}


export type _APIDefinition = {
  login: [
    {
      name: string;
      password: string;
    },
    CommonResponse<never>
  ],
  logout: [
    never,
    CommonResponse<never>
  ],
  addFeatureBlance: [
    {
      accountName: string;
      amount: number;
      featureType: string
    },
    CommonResponse<never>
  ],
  getUserInfo: [
    never,
    CommonResponse<UserBase>
  ]
}

export const _APIConfig: Record<keyof _APIDefinition, {method: 'get' | 'post', url: string}> = {
  login: {"method": "post", "url": "/api/users/login"},
  logout: {"method": "post", "url": "/api/users/logout"},
  addFeatureBlance: {"method": "post", "url": "/api/staff/user/add_feature_blance"},
  getUserInfo: {"method": "get", "url": "/api/users/me"}
}

type buildHandlerMap<Def extends Record<string, [unknown, unknown]>> = {
  [T in keyof Def]: Def[T][0] extends never ? () => Promise<Def[T][1]> : (data: Def[T][0]) => Promise<Def[T][1]>;
};

type APIFunctionMap = buildHandlerMap<_APIDefinition>;


const axiosClient = axios.create({
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});


axiosClient.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


  axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use((resp: AxiosResponse<CommonResponse>) => {
  if (resp.data?.success === false) {
    return Promise.reject(
      new APIError(
        {url: resp.config.url, data: resp.config.data || resp.config.params}, 
        resp.data
      ),
    );
  }
  return resp;
});

const _apiClient: APIFunctionMap = {} as APIFunctionMap

export function initAPI(): void {
  Object.keys(_APIConfig).forEach((key) => {
    const _key = key as keyof _APIDefinition;
    const config = _APIConfig[_key]
    _apiClient[_key] = async (data?) => {
      const data2 = data ? { ...data } : {};
      const config2: AxiosRequestConfig = {
        ...config,
      };
      if (config.method === 'post') {
        config2.data = data2;
      } else if (config.method === 'get') {
        config2.params = data2;
      }
      const resp = await axiosClient.request(config2);
      return resp.data;
    }
  })
}

export const APIClient = _apiClient;
