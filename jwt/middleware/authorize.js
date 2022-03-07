const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('helpers/db');

module.exports = authorize;

function authorize() {
    return [
        // Autentikasi token jwt dan lampirkan token yang dikodekan ke permintaan sebagai req.user
        jwt({ secret, alghorithms: ['HS256'] }),

        // Lampirkan catatan pengguna lengkap untuk meminta object
        async (req, res, next) => {
            // Dapatkan pengguna dengan id dari token 'sub' (subjek) properti
            const user = await db.User.findByPk(req.user.sub);

            // Periksa pengguna masih ada
            if (!user)
                return res.status(401).json({ message: 'Unauthorized' });

            // Authorization berhasil
            req.user = user.get();
            next();
        }
    ];
}