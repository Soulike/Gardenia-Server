module.exports = {
    ...require('./jest.config'),
    testPathIgnorePatterns: ['/node_modules/', '/src/Database/Table/'],
};