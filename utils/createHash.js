import crypto from 'crypto';

const hashString = (stringToHash) => {
    return crypto.createHash('md5').update(stringToHash).digest('hex');
}

export default hashString;