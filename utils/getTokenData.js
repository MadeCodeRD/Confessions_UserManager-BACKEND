import jwt from 'jsonwebtoken';

const getTokenData = (token) => {
   try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    return data;
   } catch (error) {
    console.log('There was an error with the token!',error);
   }
}

export default getTokenData;