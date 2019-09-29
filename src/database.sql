BEGIN TRANSACTION;

CREATE TABLE accounts
(
    "username" VARCHAR(255) PRIMARY KEY,
    "hash"     CHAR(64) NOT NULL /*SHA256*/
);

CREATE TABLE profiles
(
    "username" VARCHAR(255) REFERENCES accounts ("username") PRIMARY KEY,
    "nickname" VARCHAR(255),
    "email"    VARCHAR(255) NOT NULL,
    "avatar"   VARCHAR(255)
);

CREATE TABLE repositories
(
    "username"    VARCHAR(255) REFERENCES accounts ("username") UNIQUE NOT NULL,
    "name"        VARCHAR(255)                                       NOT NULL,
    "description" TEXT DEFAULT ''                                    NOT NULL,
    "isPublic"    BOOLEAN                                            NOT NULL,
    PRIMARY KEY ("username", "name")
);

COMMIT;