import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { APIClient } from '../../../apis/base';
import styles from './index.module.scss';
import CryptoJS from 'crypto-js';

export const RedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isExpired, setIsExpired] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  useEffect(() => {
    const key = searchParams.get('key');
    if (!key) {
      setIsExpired(true);
      return;
    }

    const getRedirectUrl = async () => {
      try {
        const currentTime = Math.floor(Date.now() / 1000);
        const params = {
          key: key,
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
  }, [searchParams]);

  return (
    <div className={styles.redirectContainer}>
      {isExpired ? (
        <div className={styles.expiredText}>
          链接失效
        </div>
      ) : redirectUrl ? (
        <iframe
          src={redirectUrl}
          className={styles.iframe}
          title="redirect content"
          allowFullScreen
        />
      ) : null}
    </div>
  );
};
