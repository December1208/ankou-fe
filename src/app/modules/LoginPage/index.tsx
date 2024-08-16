import { FC, useContext, useState } from 'react';
import styles from './index.module.scss'
import { UerStoreContext } from '../../globalStore/userStore';


export const LoginAndSignup = ()  => {

    const [isLogin, setIsLogin] = useState(true);
    const [isFirst, setIsFirst] = useState(true);

    const handleStatusChange = () => {
        setIsFirst(false);
        setIsLogin(!isLogin);
    }

    return (
        <section className={styles.user}>
            <div className={styles.user_options_container}>
                <div className={styles.user_options_text}>
                <div className={styles.user_options_unregistered}>
                    <h2 className={styles.user_unregistered_title}>Don't have an account?</h2>
                    <p className={styles.user_unregistered_text}>Banjo tote bag bicycle rights, High Life sartorial cray craft beer whatever street art fap.</p>
                    <button className={styles.user_unregistered_signup} id="signup_button" onClick={handleStatusChange}>Sign up</button></div>
                <div className={styles.user_options_registered}>
                    <h2 className={styles.user_registered_title}>Have an account?</h2>
                    <p className={styles.user_registered_text}>Banjo tote bag bicycle rights, High Life sartorial cray craft beer whatever street art fap.</p>
                    <button className={styles.user_registered_login} id="login_button" onClick={handleStatusChange}>Login</button></div>
                </div>
                <div className={`${styles.user_options_forms} ${isFirst ? '' : isLogin ? styles.bounceRight : styles.bounceLeft}`} id="user_options_forms">
                <div className={styles.user_forms_login}>
                    <h2 className={styles.forms_title}>Login</h2>
                    <form className={styles.forms_form}>
                    <fieldset className={styles.forms_fieldset}>
                        <div className={styles.forms_field}>
                        <input type="email" placeholder="Email" className={styles.forms_field_input} autoFocus required /></div>
                        <div className={styles.forms_field}>
                        <input type="password" placeholder="Password" className={styles.forms_field_input} required /></div>
                    </fieldset>
                    <div className={styles.forms_buttons}>
                        <button type="button" className={styles.forms_buttons_forgot}>Forgot password?</button>
                        <input type="submit" value="Log In" className={styles.forms_buttons_action} /></div>
                    </form>
                </div>
                <div className={styles.user_forms_signup}>
                    <h2 className={styles.forms_title}>Sign Up</h2>
                    <form className={styles.forms_form}>
                    <fieldset className={styles.forms_fieldset}>
                        <div className={styles.forms_field}>
                        <input type="text" placeholder="Full Name" className={styles.forms_field_input} required /></div>
                        <div className={styles.forms_field}>
                        <input type="email" placeholder="Email" className={styles.forms_field_input} required /></div>
                        <div className={styles.forms_field}>
                        <input type="password" placeholder="Password" className={styles.forms_field_input} required /></div>
                    </fieldset>
                    <div className={styles.forms_buttons}>
                        <input type="submit" value="Sign up" className={styles.forms_buttons_action} /></div>
                    </form>
                </div>
                </div>
            </div>
        </section>
    )
}

export const LoginPage: FC = () => {
    const userContext = useContext(UerStoreContext)

    if (userContext.isLogined) {
        return <div>You are logged in</div>
    }
    return <LoginAndSignup />
}

