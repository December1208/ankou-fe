import { useContext, useEffect, useState } from 'react';
import styles from './index.module.scss'
import { UserStoreContext } from '../../globalStore/userStore';
import { useNavigate } from 'react-router-dom';
import { APIClient } from '../../../apis/base';
import { UserBase } from '../../models/user';
import { hashPassword } from '../../common/utils';
import { APIError } from "../../../apis/base"


const LoginAndSignup = ()  => {
    const [isLogin, setIsLogin] = useState(true);
    const [isFirst, setIsFirst] = useState(true);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const userContext = useContext(UserStoreContext)
    const [laoding, setLoading] = useState(false);

    const handleStatusChange = () => {
        setIsFirst(true);
        // setIsLogin(!isLogin);
        setIsLogin(true);
    }

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (laoding) {
            return
        }
        setLoading(true)
        const encryptPassword = await hashPassword(password)
        try {
            await APIClient.login({name: name, password: encryptPassword})
            const userInfo = await APIClient.getUserInfo()
            const userBase: UserBase = {name: userInfo.data.name, id: userInfo.data.id}
            userContext.setUser(userBase)
        } catch(error) {
            if (error instanceof APIError) {
                alert(error.toString())
            }else{
                alert(error)
            }
            return 
        }
        setLoading(false)
        navigate('/home');
    }

    return (
        <section className={styles.user}>
            <div className={styles.user_options_container}>
                <div className={styles.user_options_text}>
                <div className={styles.user_options_unregistered}>
                    <h2 className={styles.user_unregistered_title}>Don't have an account?</h2>
                    <p className={styles.user_unregistered_text}></p>
                    <button className={styles.user_unregistered_signup} id="signup_button" onClick={handleStatusChange}>Sign up</button></div>
                <div className={styles.user_options_registered}>
                    <h2 className={styles.user_registered_title}>Have an account?</h2>
                    <p className={styles.user_registered_text}></p>
                    <button className={styles.user_registered_login} id="login_button" onClick={handleStatusChange}>Login</button></div>
                </div>
                <div className={`${styles.user_options_forms} ${isFirst ? '' : isLogin ? styles.bounceRight : styles.bounceLeft}`} id="user_options_forms">
                <div className={styles.user_forms_login}>
                    <h2 className={styles.forms_title}>Login</h2>
                    <form className={styles.forms_form} onSubmit={submitHandler}>
                        <fieldset className={styles.forms_fieldset}>
                            <div className={styles.forms_field}>
                                <input type="text" placeholder="用户名" className={styles.forms_field_input} onChange={(e) => setName(e.target.value)} autoFocus required />
                            </div>
                            <div className={styles.forms_field}>
                                <input type="password" placeholder="密码" className={styles.forms_field_input} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </fieldset>
                        <div className={styles.forms_buttons}>
                            <button type="button" className={styles.forms_buttons_forgot}>Forgot password?</button>
                            <input type="submit" value="Log In" className={styles.forms_buttons_action} />
                        </div>
                    </form>
                </div>
                <div className={styles.user_forms_signup}>
                    <h2 className={styles.forms_title}>Sign Up</h2>
                    <form className={styles.forms_form}>
                        <fieldset className={styles.forms_fieldset}>
                            <div className={styles.forms_field}>
                                <input type="text" placeholder="Full Name" className={styles.forms_field_input} required />
                            </div>
                            <div className={styles.forms_field}>
                                <input type="email" placeholder="Email" className={styles.forms_field_input} required />
                            </div>
                            <div className={styles.forms_field}>
                                <input type="password" placeholder="Password" className={styles.forms_field_input} required />
                            </div>
                        </fieldset>
                        <div className={styles.forms_buttons}>
                            <input type="submit" value="Sign up" className={styles.forms_buttons_action} />
                        </div>
                    </form>
                </div>
                </div>
            </div>
        </section>
    )
}

export const LoginPage = () => {
    const userContext = useContext(UserStoreContext)
    const navigate = useNavigate();
    useEffect(() => {
        if (userContext.isLogined) {
            navigate('/home');
        }
    }, [userContext.isLogined, navigate])
    
    return <LoginAndSignup />
}

