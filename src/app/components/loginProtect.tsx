import { useContext, useEffect } from "react";
import { UserStoreContext } from "../globalStore/userStore";
import { useNavigate } from "react-router-dom";

export const LoginProtectProvider = ({ children }: { children: React.ReactNode }) => {
    const userContext = useContext(UserStoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userContext.isLogined) {
            navigate("/login");
        }
    }, [userContext.isLogined, navigate]);

    return <>{children}</>; // 渲染子组件
};