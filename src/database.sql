BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "accounts"
(
    "username" VARCHAR(255) PRIMARY KEY,
    "hash"     CHAR(64) NOT NULL /*SHA256*/
);

CREATE TABLE IF NOT EXISTS  "profiles"
(
    "username" VARCHAR(255) REFERENCES "accounts" ("username") ON UPDATE CASCADE ON DELETE CASCADE PRIMARY KEY,
    "nickname" VARCHAR(255),
    "email"    VARCHAR(255) NOT NULL,
    "avatar"   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS  "repositories"
(
    "username"    VARCHAR(255) REFERENCES "accounts" ("username") ON UPDATE CASCADE NOT NULL,
    "name"        VARCHAR(255)                                                      NOT NULL,
    "description" TEXT DEFAULT ''                                                   NOT NULL,
    "isPublic"    BOOLEAN                                                           NOT NULL,
    PRIMARY KEY ("username", "name")
);

CREATE TABLE IF NOT EXISTS  "groups"
(
    "id"   SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS  "account_group"
(
    "username" VARCHAR(255) REFERENCES "accounts" ("username") ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    "group_id" INTEGER REFERENCES "groups" ("id") ON UPDATE CASCADE ON DELETE CASCADE              NOT NULL,
    UNIQUE ("username", "group_id")
);

CREATE TABLE IF NOT EXISTS  "admin_group"
(
    "admin_username" VARCHAR(255) REFERENCES "accounts" ("username") ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    "group_id"       INTEGER REFERENCES "groups" ("id")              ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    UNIQUE ("admin_username", "group_id"),
    FOREIGN KEY ("admin_username", "group_id") REFERENCES "account_group" ("username", "group_id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS  "repository_group"
(
    "repository_username" VARCHAR(255) NOT NULL,
    "repository_name"     VARCHAR(255) NOT NULL,
    "group_id"            INTEGER      NOT NULL REFERENCES "groups" ("id")  ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY ("repository_username", "repository_name") REFERENCES "repositories" ("username", "name") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("repository_username", "repository_name", "group_id")
);

COMMIT;