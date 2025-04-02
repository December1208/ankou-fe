import { useContext, useEffect } from "react";
import { UserStoreContext } from "../globalStore/userStore";
import { useNavigate } from "react-router-dom";
import { APIClient } from "../../apis/base";
import { UserBase } from "../models/user";

export const LoginProtectProvider = ({ children }: { children: React.ReactNode }) => {
    const userContext = useContext(UserStoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        // 移除嵌套的 useEffect
        APIClient.getUserInfo().then((resp) => {
            const { code } = resp 
            if (code !== 0) {
                userContext.setUser(null)
            } else {
                const {name, id} = resp.data
                const userBase: UserBase = {name, id}
                console.log(userBase)
                userContext.setUser(userBase);
            }
        }).catch(() => {
            userContext.setUser(null)
            navigate("/login");
        })

    }, [userContext.isLogined, navigate]);

    return <>{children}</>;
};