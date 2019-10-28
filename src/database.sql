BEGIN TRANSACTION;

CREATE TABLE "accounts"
(
    "username" VARCHAR(255) PRIMARY KEY,
    "hash"     CHAR(64) NOT NULL /*SHA256*/
);

CREATE TABLE "profiles"
(
    "username" VARCHAR(255) REFERENCES accounts ("username") PRIMARY KEY,
    "nickname" VARCHAR(255),
    "email"    VARCHAR(255) NOT NULL,
    "avatar"   VARCHAR(255)
);

CREATE TABLE "repositories"
(
    "username"    VARCHAR(255) REFERENCES accounts ("username")      NOT NULL,
    "name"        VARCHAR(255)                                       NOT NULL,
    "description" TEXT DEFAULT ''                                    NOT NULL,
    "isPublic"    BOOLEAN                                            NOT NULL,
    PRIMARY KEY ("username", "name")
);

CREATE TABLE "groups"
(
    "id"   SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL
);

CREATE TABLE "account_group"
(
    "username" VARCHAR(255) REFERENCES "accounts" ("username") NOT NULL,
    "group_id" INTEGER REFERENCES "groups" ("id")              NOT NULL,
    UNIQUE ("username", "group_id")
);

CREATE TABLE "admin_group"
(
    "admin_username" VARCHAR(255) REFERENCES "accounts" ("username") NOT NULL,
    "group_id"       INTEGER REFERENCES "groups" ("id")              NOT NULL,
    UNIQUE ("admin_username", "group_id"),
    FOREIGN KEY ("admin_username", "group_id") REFERENCES "account_group"("username","group_id")
);

CREATE TABLE "repository_group"
(
    "repository_username" VARCHAR(255) NOT NULL,
    "repository_name" VARCHAR(255)     NOT NULL,
    "group_id" INTEGER NOT NULL REFERENCES "groups"("id"),
    FOREIGN KEY("repository_username", "repository_name") REFERENCES "repositories"("username", "name"),
    UNIQUE ("repository_username", "repository_name", "group_id")
);

COMMIT;