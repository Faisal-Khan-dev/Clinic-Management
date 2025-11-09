import jwt from 'jsonwebtoken'

export const auth = (req , res , next) => {
    try {
        
        const token = req?.headers?.authorization?.split(" ")[1]
        console.log("Authorization Header:", req.headers.authorization);
       console.log("token" , token);

        if (token) {

            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;

            next()
       } else {
            return res.status(401).json({
                status: false,
                message: "Unauthorized user",
            });
       }
       
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired, please log in again.",
                status: false,
            });
        }
        return res.status(500).json({
            message: error.message || "something went wrong",
            status: false,
        })
    }
}