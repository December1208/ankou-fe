import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { APIClient } from '../../../apis/base';
import styles from './index.module.scss';

export const RedirectPage: React.FC = () => {
  const { token, md5_str } = useParams<{ token: string; md5_str: string }>();
  const [searchParams] = useSearchParams();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const t = searchParams.get('t');
    if (!token || !md5_str || !t) {
      setIsExpired(true);
      return;
    }

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
  }, [token, md5_str, searchParams]);

  return (
    <div className={styles.redirectContainer}>
      {isExpired && (
        <div className={styles.expiredText}>
          链接失效
        </div>
      )}
    </div>
  );
};
