import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { APIClient } from '../../../apis/base';
import styles from './index.module.scss';

export const RedirectPage: React.FC = () => {
  const { token, md5_str } = useParams<{ token: string; md5_str: string }>();
  const [searchParams] = useSearchParams();
  const [isExpired, setIsExpired] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 验证参数是否存在
    const t = searchParams.get('t');
    if (!token || !md5_str || !t) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 倒计时结束后获取跳转链接
          const getRedirectUrl = async () => {
            try {
              const response = await APIClient.getRedirectUrl({
                token,
                md5_str,
                t: parseInt(t)
              });
              window.location.href = response.data.url;
            } catch (error) {
              setIsExpired(true);
            }
          };
          getRedirectUrl();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, md5_str, searchParams]);

  return (
    <div className={styles.redirectContainer}>
      {!isExpired && countdown > 0 ? (
        <div className={styles.countdownText}>
          {countdown} 秒后自动跳转...
        </div>
      ) : (
        <div className={styles.expiredText}>
          链接失效
        </div>
      )}
    </div>
  );
};
