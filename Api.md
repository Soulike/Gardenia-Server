# 接口文档

## 对象

### `ResponseBody`

后端的响应体均由以下类构建：

```ts
/**
 * @class
 * @description HTTP 响应体的标准格式对象
 * */
class ResponseBody<TBody>
{
    public isSuccessful: boolean;
    public message?: string;
    public data?: TBody;
}
```

### `Account`

```ts
class Account
{
    public username: string;
    public hash: string;
}
```

### `Repository`

```ts
/**
 * @class
 * @description 仓库基本信息
 * */
class Repository
{
    public username: string;
    public name: string;
    public description: string;
    public isPublic: boolean;
}
```

### `Commit`

```ts
/**
 * @class
 * @description 提交的详细信息
 * */
class Commit
{
    public commitHash: string;
    public committerName: string;
    public committerEmail: string;
    public time: string;
    public message: string;
}
```

### `Profile`

```ts
/**
 * @class
 * @description 账号资料，对应数据库 profiles 表
 * */
class Profile
{
    public username: string;
    public nickname: string;
    public email: string;
    public avatar: string;
}
```

### `Group`

```ts
class Group
{
    public id: number;
    public name: string;
}
```

---

## 常量

### ObjectType

Git 对象的类型

```ts
export enum ObjectType
{
    BLOB = 'blob',
    TREE = 'tree'
}
```

---

## 模块接口信息

所有接口均有前缀 `/server`。

参数错误时返回消息为“请求参数错误”，服务器发送错误时返回消息为“服务器错误”。

路由按照标题进行级连，例如 `/repository/info/directory`。

### Account 模块（`/account`）

本模块负责账号相关操作。

#### `/login`

- 功能：登录
- 方法：POST
- 请求体：`Account` 类的实例
- 响应体：无
- 响应消息：
  - 用户名或密码错误
- 其他说明：
  - 在用户名不存在时，也返回用户名或密码错误
  - 散列值计算方法：H(H(*username*) || H(*password*))，算法采用 SHA256
  - 数据库只存储散列

#### `/register`

- 功能：注册
- 方法：POST
- 请求体：
```ts
{
    account: Account,
    profile: Omit<ProfileClass, 'username'>,
}
```
- 响应体：无
- 响应消息：
  - 用户名已存在

#### `/checkSession`

- 功能：检测当前 Session 是否有效
- 方法：GET
- 请求体：无
- 响应体：
```ts
{
    isValid: boolean,
}
```
- 响应消息：无
- 其他说明：无

#### `/logout`

- 功能：退出登录
- 方法：POST
- 请求体：无
- 响应体：无
- 响应消息：无
- 其他说明：无

#### `/getGroups`

- 功能：获取账号所属小组
- 方法：GET
- 请求体：
```ts
{
    json: {
        username: string,
    }
}
```
- 响应体：`Group[]`
- 响应消息：
  - 用户不存在
- 其他说明：无

#### `/getAdministratingGroups`

- 功能：获取账号管理的小组
- 方法：GET
- 请求体：
```ts
{
    json: {
        username: string,
    }
}
```
- 响应体：`Group[]`
- 响应消息：
  - 用户不存在
- 其他说明：无

### Profile 模块（`/profile`）

本模块负责用户资料的相关操作。

#### `/get`

- 功能：获取用户资料
- 方法：GET
- 请求体：
```ts
{
    json: {
        username?: string,
    }
}
```
- 响应体：`Profile` 类实例
- 响应消息：
  - 用户不存在
- 其他说明：
  - 如果未提供 `username`，就根据 session 获取

### Git 模块

Git 模块供普通 Git 命令行指令调用，直接转发到 `git http-server` 官方 CGI 脚本。

### Repository 模块（`/repository`）

本模块负责执行 Git 仓库的相关操作。

#### `/getList`

- 功能：获得仓库列表
- 方法：GET
- 请求参数：
```ts
{
    json: {
        start: number,  // 起始索引，从 0 开始
        end: number,    // 结束索引，不包含在结果内
        username?: string,  // 限定仓库所有者
    }
}
```
- 响应体：`Array<Repository>`
- 响应消息：无
- 其他说明：
  - 如果登录人与仓库所有者不是同一个人，只返回公有仓库
  - 如果登录人与仓库所有者是同一个人，公私有仓库均返回
  - 数据库中剩余多少条就返回多少条

#### `/create`

- 功能：创建新的仓库
- 方法：POST
- 请求体：`Repository` 类的实例
- 响应体：无
- 响应消息：
  - 仓库已存在
- 其他说明：无

#### `/del`

- 功能：删除仓库
- 方法：POST
- 请求体：
```ts
{
    repositoryName: string,   // 仓库的名字
}
```
- 响应体：无
- 响应消息：
  - 仓库不存在
- 其他说明：无

### RepositoryInfo 模块（`/repositoryInfo`）

本模块负责执行 Git 仓库内容信息操作。

#### `/repository`

- 功能：获取仓库基本信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        username: string,   // 仓库所有者的名字
        repositoryName: string,       // 仓库的名字
    }
}
```
- 响应体：`Repository` 类的实例
- 响应消息：
  - 仓库不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404

#### `/branch`

- 功能：获取仓库分支列表
- 方法：GET
- 请求参数：
```ts
{
    json: {
        username: string,   // 仓库所有者的名字
        repositoryName: string,       // 仓库的名字
    }
}
```
- 响应体：`Array<string>`（所有分支名组成的数组，主分支放在第一个）
- 响应消息：
  - 仓库不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404

#### `/lastCommit`

- 功能：获取仓库最后一次提交信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        username: string,   // 仓库所有者的名字
        repositoryName: string,       // 仓库的名字
        commitHash: string,
        filePath?: string,      // 文件，相对路径
    }
}
```
- 响应体：`Commit` 类实例
- 响应消息：
  - 仓库不存在
  - 分支或文件不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404

#### `/directory`

- 功能：获取仓库某目录所有文件/目录的信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        username: string,   // 仓库所有者的名字
        repositoryName: string,       // 仓库的名字
        commitHash: string,
        directoryPath: string,       // 文件/目录的路径
    }
}
```
- 响应体：文件路径、类型与最后一次提交信息的数组
```ts
Array<{ type: ObjectType, path: string, commit: Commit }>
```
- 响应消息：
  - 仓库不存在
  - 文件不存在
  - 分支不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404
  - 对数组进行排序，类型为 TREE 的在前，BLOB 的在后

#### `/commitCount`

- 功能：获取仓库提交次数
- 方法：GET
- 请求参数：
```ts
{
    json: {
        username: string,   // 仓库所有者的名字
        repositoryName: string,       // 仓库的名字
        commitHash: string,
    }
}
```
- 响应体：
```ts
{
    commitCount: number,    // 指定分支的提交次数
}
```
- 响应消息：
  - 仓库不存在
  - 分支不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404
  - 当 `branch` 值是 `HEAD` 时，如果查询不到提交次数，向前端返回提交次数 0 而不是报错
    - 用于前端判断仓库是不是空仓库

#### `/fileInfo`

- 功能：获取指定文件信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        username: string,           // 仓库所有者名字
        repositoryName: string,     // 仓库名字
        filePath: string,           // 文件相对仓库目录的路径
        commitHash: string,         // commit hash 值
    }
}
```
- 响应体：
```ts
{
    exists: boolean,        // 文件是否存在，如果不存在，就不需要返回其他参数
    type?: ObjectType,      // 对象类型，如果是 TREE 就不需要下面剩余参数
    size?: number,          // 文件大小
    isBinary?: boolean,     // 是否是二进制文件
}
```
- 响应消息：
  - 仓库不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404
  - 在文件不存在时，不返回 404

#### `/rawFile`

- 功能：获取文件内容
- 方法：GET
- 请求参数：
```ts
{
    json: {
        username: string,           // 仓库所有者名字
        repositoryName: string,     // 仓库名字
        filePath: string,           // 文件相对仓库目录的路径
        commitHash: string,         // commit hash 值
    }
}
```
- 响应体：二进制文件流
- 响应消息：
  - 仓库不存在
  - 文件不存在
  - 提交不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404
  - 直接调用标准输出流和响应流进行发送

#### `/setName`

- 功能：修改仓库名
- 方法：POST
- 请求参数：
```ts
{
    repositoryName: string,     // 仓库名字
    newRepositoryName: string,
}
```
- 响应体：无
- 响应消息：
  - 仓库不存在
  - 仓库名已存在
- 其他说明：无

#### `/setDescription`

- 功能：修改仓库名
- 方法：POST
- 请求参数：
```ts
{
    repositoryName: string,     // 仓库名字
    description: string,

}
```
- 响应体：无
- 响应消息：
  - 仓库不存在
- 其他说明：无

#### `/groups`

- 功能：获取仓库所属小组
- 方法：GET
- 请求体：
```ts
{
    json: {
        repository: Pick<Repository, 'username'|'name'>,
    }
}
```
- 响应体：`Group[]`
- 响应消息：
  - 仓库不存在
- 其他说明：无

#### `/addToGroup`

- 功能：添加仓库到小组
- 方法：POST
- 请求体：
```ts
{
    repository: Pick<Repository, 'username'|'name'>,
    group: Pick<Group, 'id'>,
}
```
- 响应体：无
- 响应消息：
  - 仓库不存在
  - 小组不存在
  - 添加失败：您不是仓库的所有者
  - 添加失败：您不是小组的成员
- 其他说明：
  - 仅仓库所有者可以执行本操作
  - 仅当是小组的成员是可以执行本操作

### Group 模块（`/group`）

#### `/info`

- 功能：获取小组信息
- 方法：GET
- 请求体：
```ts
{
    json: {
        group: Pick<Group, 'id'>
    }
}
```
- 响应体：`Group`
- 响应消息：
  - 小组不存在
- 其他说明：无

#### `/accounts`

- 功能：获取小组成员信息
- 方法：GET
- 请求体：
```ts
{
    json: {
        group: Pick<Group, 'id'>
    }
}
```
- 响应体：`Account[]`
- 响应消息：
  - 小组不存在
- 其他说明：无

#### `/addAccounts`

- 功能：添加小组成员
- 方法：POST
- 请求体：
```ts
{
    group: Pick<Group, 'id'>,
    usernames: string[],
}
```
- 响应体：无
- 响应消息：
  - 小组不存在
  - 用户不存在
  - 权限不足
- 其他说明：
  - 仅小组管理员添加请求有效，其他人均权限不足

#### `/removeAccounts`

- 功能：删除小组成员
- 方法：POST
- 请求体：
```ts
{
    group: Pick<Group, 'id'>,
    usernames: string[],
}
```
- 响应体：无
- 响应消息：
  - 小组不存在
  - 权限不足
- 其他说明：
  - 仅小组管理员删除请求有效，其他人均权限不足

#### `/admins`

- 功能：获取小组管理员信息
- 方法：GET
- 请求体：
```ts
{
    json: {
        group: Pick<Group, 'id'>
    }
}
```
- 响应体：`Account[]`
- 响应消息：
  - 小组不存在
- 其他说明：无

#### `/addAdmins`

- 功能：添加小组管理员
- 方法：POST
- 请求体：
```ts
{
    group: Pick<Group, 'id'>,
    usernames: string[],
}
```
- 响应体：无
- 响应消息：
  - 小组不存在
  - 用户不存在
  - 用户${username}不是小组成员
  - 权限不足
- 其他说明：
  - 仅小组管理员添加请求有效，其他人均权限不足
  - 仅小组成员可以成为管理员

#### `/removeAdmins`

- 功能：删除小组管理员
- 方法：POST
- 请求体：
```ts
{
    group: Pick<Group, 'id'>,
    usernames: string[],
}
```
- 响应体：无
- 响应消息：
  - 小组不存在
  - 权限不足
- 其他说明：
  - 仅小组管理员删除请求有效，其他人均权限不足

#### `/repositories`

- 功能：获取小组仓库信息
- 方法：GET
- 请求体：`Pick<Group, 'id'>`
- 响应体：`Repository[]`
- 响应消息：
  - 小组不存在
- 其他说明：无

#### `/removeRepositories`

- 功能：删除小组仓库
- 方法：POST
- 请求体：
```ts
{
    group: Pick<Group, 'id'>,
    repositories: Pick<Repository, 'username' | 'name'>[],
}
```
- 响应体：无
- 响应消息：
  - 小组不存在
  - 仓库不存在
  - 删除失败：您不是小组的管理员
- 其他说明：
  - 只有小组的管理员可以执行本操作