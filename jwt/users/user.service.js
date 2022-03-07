const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt.js');
const db = require('helpers/db');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // Authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresin: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.user.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // Validate
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username"' + params.username + '"is already taken';
    }

    // Hash Password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 18);
    }
    // Save user
    await db.User.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // Validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username"' + params.username + '" is already taken';
    }

    // Hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params, password, 18);
    }

    // Copy Params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// Helper Functions

async function getUser(id) {
    const use = await db.User.findByPk(id);
    if (!user) throw 'user tidak terdaftar';
    return user;
}

function omitHash(user) {
    const { hash, ...userwithoutHash } = user;
    return userwithoutHash;
}