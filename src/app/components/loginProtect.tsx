import { useContext, useEffect, useState } from "react";
import { UserStoreContext } from "../globalStore/userStore";
import { useNavigate } from "react-router-dom";
import { APIClient } from "../../apis/base";
import { UserBase } from "../models/user";
import { USER_ROLES } from "../constants";

export const LoginProtectProvider = ({ children }: { children: React.ReactNode }) => {
    const userContext = useContext(UserStoreContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        APIClient.getUserInfo().then((resp) => {
            const { code } = resp 
            if (code !== 0) {
                userContext.setUser(null);
                navigate("/login");
            } else {
                const {name, id, role} = resp.data;
                const userBase: UserBase = {name, id, role};
                userContext.setUser(userBase);
            }
        }).catch(() => {
            userContext.setUser(null);
            navigate("/login");
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return null; // 或者返回一个加载状态组件
    }

    return <>{children}</>;
};


export const AdminProtectProvider = ({ children }: { children: React.ReactNode }) => {
    const userContext = useContext(UserStoreContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        APIClient.getUserInfo().then((resp) => {
            const { code } = resp 
            if (code !== 0) {
                userContext.setUser(null);
                navigate("/login");
            } else {
                const {name, id, role} = resp.data;
                const userBase: UserBase = {name, id, role};
                userContext.setUser(userBase);
                if (role !== USER_ROLES.ADMIN) {
                    userContext.setUser(null);
                    navigate("/home");
                }
            }
        }).catch(() => {
            userContext.setUser(null);
            navigate("/login");
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return null; // 或者返回一个加载状态组件
    }

    return <>{children}</>;
};