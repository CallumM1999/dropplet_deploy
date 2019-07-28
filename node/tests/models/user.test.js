require('dotenv').config();
process.env.TESTING = true;
const expect = require('expect');

const con = require('../../db/connection');
const resetUserTable = require('../testUtils/resetUserTable');
const resetProfileTable = require('../testUtils/resetProfileTable');
const asyncQuery = require('../../helpers/asyncQuery');

const {
    checkUsernameAvailable,
    register,
    login,
    updateUsername,
    updateEmail,
    updatePassword,
    getPassword,
    updateProfileImage,
    deleteProfileImage,
    deleteAccount,
} = require('../../models/user');

describe('checkUsernameAvailable model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
    };

    beforeEach(async done => {
        await resetUserTable();
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        await asyncQuery(con, query2);
        done();
    });

    test('existing username', async done => {
        const result = await checkUsernameAvailable(user.username);
        expect(result).toBe(false);
        done();
    });

    test('new username', async done => {
        const result = await checkUsernameAvailable(user.username + 'a');
        expect(result).toBe(true);
        done();
    });
});

describe('login model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
    };

    beforeEach(async done => {
        await resetUserTable();
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        await asyncQuery(con, query2);
        done();
    });

    test('valid user', async done => {
        const result = await login(user.email);
        expect(result.username).toBe(user.username);
        expect(result.password).toBe(user.password);
        done();
    });

    test('non valid user', async done => {
        const result = await login(user.email + 'a');
        expect(result).toBe(null);
        done();
    });
});

describe('register model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
    };

    const newUser = {
        email: 'email2@email.com',
        password: 'Password1234!',
        username: 'username12346',
    };

    beforeEach(async done => {
        await resetUserTable();
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        await asyncQuery(con, query2);
        done();
    });

    test('existing user', async done => {
        register(user.username, user.email, user.password)
            .then(() => {
                throw 'Should throw error';
            })
            .catch(err => {
                expect(err).not.toBe('Should throw error');
                done();
            });
    });

    test('valid user', async done => {
        const result = await register(newUser.username, newUser.email, newUser.password);
        expect(!!result).toBe(true);
        done();
    });
});

describe('update username model', () => {
    const user1 = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
    };

    const user2 = {
        email: 'email2@email.com',
        password: 'Password1234!',
        username: 'username4321',
        id: null,
    };

    const newUsername = 'somenewusername';

    beforeEach(async done => {
        await resetUserTable();

        const query1 = `INSERT INTO user (email, password, username) VALUES ('${user1.email}','${user1.password}','${user1.username}');`;
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user2.email}','${user2.password}','${user2.username}');`;

        const res = await Promise.all([asyncQuery(con, query1), asyncQuery(con, query2)]);

        user1.id = res[0].insertId;
        user2.id = res[1].insertId;
        done();
    });

    test('taken username', async done => {
        try {
            await updateUsername(user1.id, user2.username);
        } catch (e) {
            expect(e.code).toBe('ER_DUP_ENTRY');
            done();
        }
    });

    test('available username', async done => {
        await updateUsername(user1.id, newUsername);

        const query = `select username from user where id = ${user1.id};`;

        con.query(query, (err, result) => {
            if (err) done(err);
            expect(result[0].username).toBe(newUsername);
            done();
        });
    });
});

describe('update email model', () => {
    const user1 = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
    };

    const user2 = {
        email: 'email2@email.com',
        password: 'Password1234!',
        username: 'username4321',
        id: null,
    };

    const newEmail = 'newemail@email.com';

    beforeEach(async done => {
        await resetUserTable();

        const query1 = `INSERT INTO user (email, password, username) VALUES ('${user1.email}','${user1.password}','${user1.username}');`;
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user2.email}','${user2.password}','${user2.username}');`;

        const res = await Promise.all([asyncQuery(con, query1), asyncQuery(con, query2)]);

        user1.id = res[0].insertId;
        user2.id = res[1].insertId;
        done();
    });

    test('taken email', async done => {
        try {
            await updateEmail(user1.id, user2.email);
        } catch (e) {
            expect(e.code).toBe('ER_DUP_ENTRY');
            done();
        }
    });

    test('available email', async done => {
        await updateEmail(user1.id, newEmail);

        const query = `select email from user where id = ${user1.id};`;

        con.query(query, (err, result) => {
            if (err) done(err);
            expect(result[0].email).toBe(newEmail);
            done();
        });
    });
});

describe('update password model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
    };

    const newPassword = 'newpassword';

    beforeEach(async done => {
        await resetUserTable();
        const query = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        const res = await asyncQuery(con, query);

        user.id = res.insertId;
        done();
    });

    test('Update password', async done => {
        await updatePassword(user.id, newPassword);

        const query = `select password from user where id = ${user.id};`;

        con.query(query, (err, result) => {
            if (err) done(err);
            expect(result[0].password).toBe(newPassword);
            done();
        });
    });
});

describe('get password model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
    };

    beforeEach(async done => {
        await resetUserTable();
        const query = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        const res = await asyncQuery(con, query);

        user.id = res.insertId;
        done();
    });

    test('Update password', async done => {
        const password = await getPassword(user.id);
        expect(password).toBe(user.password);
        done();
    });
});

describe('update profile image model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
    };

    afterEach(async done => {
        await resetProfileTable();
        done();
    });

    beforeEach(async done => {
        await resetUserTable();
        const query = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        const res = await asyncQuery(con, query);

        user.id = res.insertId;
        done();
    });

    test('Update image url', async done => {
        const profileImage = 'someprofileimage';
        await updateProfileImage(user.id, profileImage);

        const query = `update profile set profile_image = '${profileImage}' where id = ${user.id}`;

        con.query(query, (err, response) => {
            if (err) done(err);

            const query = `SELECT * FROM user left join profile on profile.id = user.id WHERE user.id = ${user.id}`;

            con.query(query, (err, response) => {
                if (err) done(err);

                expect(response[0].profile_image).toBe(profileImage);
                done();
            });
        });
    });
});

describe('delete profile image model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
        profileImage: 'someprofileimage',
    };

    beforeEach(async done => {
        await resetUserTable();
        const query1 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        const res = await asyncQuery(con, query1);

        user.id = res.insertId;
        const query2 = `INSERT INTO profile (id, profile_image) VALUES (${user.id}, '${user.profileImage}');`;
        await asyncQuery(con, query2);

        done();
    });

    afterEach(async done => {
        await resetProfileTable();
        done();
    });

    test('Delete image url', async done => {
        await deleteProfileImage(user.id);

        const query = `SELECT * FROM profile WHERE id = ${user.id}`;
        con.query(query, (err, response) => {
            if (err) done(err);

            expect(response.length).toBe(0);
            done();
        });
    });
});

describe('delete account', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
        profileImage: 'someprofileimage',
    };

    beforeEach(async done => {
        await resetUserTable();
        const query = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        await asyncQuery(con, query);

        done();
    });

    afterEach(async done => {
        await resetProfileTable();
        done();
    });

    test('Delete account', async done => {
        await deleteAccount(user.id);

        const query = `SELECT * FROM user WHERE id = ${user.id}`;
        con.query(query, (err, response) => {
            if (err) done(err);

            expect(response.length).toBe(0);
            done();
        });
    });
});
