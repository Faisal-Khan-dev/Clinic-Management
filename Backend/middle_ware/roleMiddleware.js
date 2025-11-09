export const role = ((role) => {
    
    return (req, res, next) => {
        try {

            if (req.user.role !== role) {

                return res.status(403).json({
                    status: false,
                    message: "Access denied!",
                });
            }

            next()
            
        } catch(error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

})