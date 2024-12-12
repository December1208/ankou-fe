import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './index.module.scss'
import { useContext, useState } from 'react';
import { APIClient, APIError } from '../../../apis/base';
import {FEATURE_OPTIONS} from './constants';
import { UserStoreContext } from '../../globalStore/userStore';


// 顶部导航栏组件
const Header = () => {
    const userContext = useContext(UserStoreContext);
    const navigate = useNavigate();
    const handleLogout = () => {
        try{
            APIClient.logout()
            userContext.setUser(null); // 假设 UserStoreContext 提供了 setUser 方法
            navigate("/login")
        } catch (error) {
            alert(error)
        }
        
    };
    return (
        <div className={styles.header}>
            <div className={styles.header_title}>光圈小工具</div>
            {/* <div className={styles.search_bar}>
                <span className={styles.icon}>🔍</span>
                <input type="text" placeholder="搜索软件..." />
            </div> */}
            <div className={styles.user_info}>
                <div className={styles.username}>{userContext.getUser()?.name}</div>
                <button className={styles.button} onClick={handleLogout}>退出登录</button>
            </div>
        </div>
    );
};

// const TabBar = () => {
//     const tabs = ['全部', '社交', '生活', '购物', '阅读', '休闲', '旅行', '办公', '工具'];
//     return (
//         <div className={styles.tab_bar}>
//             {tabs.map((tab, index) => (
//                 <a href="#" key={index} className={`${styles.tab} ${index === 0 ? styles.active:''}`}>
//                     {tab}
//                 </a>
//             ))}
//         </div>
//     );
// };

// 单个卡片组件
const Card = ({ 
    icon,
    title,
    category,
    description, 
    tags
}: {
    icon: string;
    title: string;
    category: string;
    description: string;
    tags: Array<{text: string; type: string}>;
}) => {
    const navigate = useNavigate();
    const handleExpand = () => {
        navigate(`/home?modalOpen=${title}`);
    };

    return (
        <div className={styles.card}>
            <img src={icon} alt={`${title}图标`} className={styles.card_icon} />
            <div className={styles.card_title}>{title}</div>
            <div className={styles.card_category}>{category}</div>
            <div className={styles.card_description}>{description}</div>
            <div className={styles.card_tags}>
                {tags.map((tag, index) => (
                    <span key={index} className={`${styles.tag} ${styles[tag.type]}`}>
                        {tag.text}
                    </span>
                ))}
            </div>
            <div className={styles.expand_button} onClick={handleExpand}>
                展开 ↘︎
            </div>
        </div>
    );
};


const FeatureBalanceModal = () => {
    const [ , setSearchParams] = useSearchParams();
    const [featureType, setFeatureType] = useState('');
    const [featureAmount, setFeatureAmount] = useState<number>(0);
    const [accountName, setAccountName] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // 用于存储错误信息

    const handlerSumbit = async () => {
        if (!accountName) {
            setErrorMessage('账号名不能为空'); 
            return
        }
        if (!featureType) {
            setErrorMessage('请选择功能');
            return;
        }
        if (featureAmount <= 0) {
            setErrorMessage('额度需要大于0');
            return
        }
        try {
            await APIClient.addFeatureBlance({accountName: accountName, featureType: featureType, amount: featureAmount})
            alert("添加成功")
            setSearchParams({})
        } catch (error) {
            if (error instanceof APIError) {
                setErrorMessage(error.resp.msg)
            } else {
                setErrorMessage(error instanceof Error ? error.message : '未知错误')
            }
            return 
        }
    }

    return (
        <div className={styles.modal}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <span 
                    className={styles.close_icon} 
                    onClick={() => setSearchParams({})}
                >
                    ×
                </span>
                <h2>添加功能额度</h2>
                <input 
                    type="text" 
                    placeholder="账号名" 
                    value={accountName} 
                    onChange={(e) => setAccountName(e.target.value)} 
                />
                <select 
                    value={featureType}
                    onChange={(e) => setFeatureType(e.target.value)}
                    className={styles.forms_field_input}
                    required
                >
                    <option value="" disabled>请选择功能</option>
                    {FEATURE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <input 
                    type="text" 
                    placeholder="额度" 
                    value={featureAmount} 
                    min="0"
                    step="1"
                    onChange={(e) => setFeatureAmount(parseInt(e.target.value) || 0)} 
                />
                {errorMessage && <div className={styles.error_message}>{errorMessage}</div>}
                <div className={styles.modal_footer}>
                    <button className={styles.submit_button} onClick={handlerSumbit}>提交</button>
                </div>
            </div>
        </div>
    )
}


// 主内容组件
const MainContent = () => {
    const [ searchParams, ] = useSearchParams();
    const modalOpen = searchParams.get('modalOpen');
    const cards = [
        {
            icon: 'https://via.placeholder.com/40',
            title: '添加功能额度',
            category: '扩展包',
            description: '给账号添加功能额度,如评论统计时长、预警/叫醒次数',
            tags: [{ text: 'STAFF', type: 'free' }]
        },
        // {
        //     icon: 'https://via.placeholder.com/40',
        //     title: '白名单',
        //     category: '扩展包',
        //     description: '给用户添加白名单',
        //     tags: [{ text: 'STAFF', type: 'free' }],
        // },
        // {
        //     icon: 'https://via.placeholder.com/40',
        //     title: '设置验证码',
        //     category: '工具',
        //     description: '可以给某个手机号设置验证码',
        //     tags: [{text: 'STAFF', type: 'free'}]
        // },
    ];

    return (
        <div className={styles.main_content}>
            <div className={styles.cards_container}>
                {cards.map((card, index) => (
                    <Card key={index} {...card} />
                ))}
            </div>
            {modalOpen && <FeatureBalanceModal />}
        </div>
    );
};

export const HomePage = () => {

    return (
        <div>
            <Header />
            {/* <TabBar /> */}
            <MainContent />
        </div>
    );
};
