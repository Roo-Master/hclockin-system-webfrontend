// apps/backend-api/jest.config.js
module.exports = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: ".",
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": [
            "ts-jest",
            {
                tsconfig: {
                    // Override module settings for Jest
                    module: "commonjs",
                    moduleResolution: "node",
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    isolatedModules: true,
                },
                isolatedModules: true,
            },
        ],
    },
    collectCoverageFrom: ["src/**/*.(t|j)s"],
    coverageDirectory: "./coverage",
    testEnvironment: "node",
    moduleNameMapper: {
        "^src/(.*)$": "<rootDir>/src/$1",
        "^@chronos/database$": "<rootDir>/../../packages/database/src",
        "^@chronos/database/(.*)$": "<rootDir>/../../packages/database/src/$1",
        "^@chronos/types-common$": "<rootDir>/../../packages/types-common/src",
        "^@chronos/types-common/(.*)$": "<rootDir>/../../packages/types-common/src/$1",
    },
    transformIgnorePatterns: ["node_modules/(?!(prisma-client|@chronos)/)"],
    preset: "ts-jest",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};