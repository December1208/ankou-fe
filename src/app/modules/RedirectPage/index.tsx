import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { APIClient } from '../../../apis/base';
import styles from './index.module.scss';
import CryptoJS from 'crypto-js';

export const RedirectPage: React.FC = () => {
  const { token, md5_str } = useParams<{ token: string; md5_str: string }>();
  const [searchParams] = useSearchParams();
  const [isExpired, setIsExpired] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  useEffect(() => {
    const t = searchParams.get('t');
    if (!token || !md5_str || !t) {
      setIsExpired(true);
      return;
    }

    const getRedirectUrl = async () => {
      try {
        const currentTime = Math.floor(Date.now() / 1000);
        const params = {
          token,
          md5_str,
          t1: parseInt(t),
          t: currentTime,
        };
        
        // 按键名排序并拼接参数
        const signStr = Object.keys(params)
          .sort()
          .map(key => `${key}=${params[key as keyof typeof params]}`)
          .join('&');
        
        const response = await APIClient.getRedirectUrl({
          ...params,
          sign: CryptoJS.MD5(signStr).toString()
        });
        setRedirectUrl(response.data.url);
      } catch (error) {
        setIsExpired(true);
      }
    };
    
    getRedirectUrl();
  }, [token, md5_str, searchParams]);

  return (
    <div className={styles.redirectContainer}>
      {isExpired ? (
        <div className={styles.expiredText}>
          链接失效
        </div>
      ) : redirectUrl ? (
        <iframe
          src="www.baidu.com"
          className={styles.iframe}
          title="redirect content"
          allowFullScreen
        />
      ) : null}
    </div>
  );
};
