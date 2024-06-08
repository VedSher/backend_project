// for Try-catch wala approch

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500.json({
//             success: false,
//             message: err.message
//         }))
//     }
// }


const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
<<<<<<< HEAD
        Promise.resolve(requestHandler(req, res, next)).catch
        ((err) => next(err))
=======
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
>>>>>>> 5af6fe8339b4a728544dcefd6196b5621041ebfa
    }
}
 

export {asyncHandler}