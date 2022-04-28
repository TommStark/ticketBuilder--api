const jwt = require('jsonwebtoken');

function verifyToken (req, res, next) {
    const token = req.get('Authorization');
    jwt.verify(token, 'secret',(err, decoded) => {
        if(err){
            return res.status(401).json({
                msg:'You are not authorized to view this page',
            });
        }
        req.author = decoded;
        next();
    })
}

module.exports = verifyToken;
