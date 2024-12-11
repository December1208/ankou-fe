import CryptoJS from 'crypto-js';

const HashSalt = '7b5da7a01a845ee2b50981cafce899eb8959b168cdd5869ddb7fe902775aedc3';

export async function hashPassword(password: string): Promise<string> {
    const saltedPassword = password + HashSalt;
    return CryptoJS.SHA256(saltedPassword).toString();
}
