const userSqlMapping = {
    query: 'SELECT * FROM member_info WHERE name=?',
    insert: 'INSERT INTO member_info (name, gender) VALUES (?,?)',
    update: 'UPDATE member_info SET gender=? where name=?',
};

module.exports = userSqlMapping;