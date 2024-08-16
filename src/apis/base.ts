import axios, { AxiosRequestConfig } from "axios";


interface CommonResponse<dataT = never> {
  code: number;
  data: dataT;
  success: boolean;
  msg: string;
}


export type _APIDefinition = {
  login: [
    {
      email: string;
      password: string;
    },
    CommonResponse<never>
  ],
}

export const _APIConfig: Record<keyof _APIDefinition, {method: 'get' | 'post', url: string}> = {
  login: {"method": "post", "url": "/api/login"},

}
type APIHandlerMap = {
  [T in keyof _APIDefinition]: _APIDefinition[T] extends [infer Data, infer Response] 
  ? Data extends never ? () => Promise<Response> : (data: Data) => Promise<Response> : never;
}



const axiosClient = axios.create({
    baseURL: 'https://api.example.com', // API 基础 URL
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


axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const _apiClient: APIHandlerMap = {} as APIHandlerMap

export function initAPI(): void {
  Object.keys(_APIConfig).forEach((key) => {
    const _key = key as keyof _APIDefinition;
    const config = _APIConfig[_key]
    _apiClient[_key] = (data) => {
      const data2 = { ...data };
      const config2: AxiosRequestConfig = {
        ...config,
      };
      if (config.method === 'post') {
        config2.data = data2;
      } else if (config.method === 'get') {
        config2.params = data2;
      }
      return axiosClient.request(config2).then((resp) => {
        return resp.data;
      });
    }
  })
}

export const APIClient = _apiClient;
