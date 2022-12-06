
const notFoundMiddleware = (req, res, next) => {
     res.send('This route does not exist!');
}

export default notFoundMiddleware;