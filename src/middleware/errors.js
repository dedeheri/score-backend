exports.handleError = (error, req, res, next) => {
    const status = error.errorStatus || 500;
    const massage = error.massage;
    const data = error.data;

    res.status(status).json({
        massage : massage,
        error : data
    })
}