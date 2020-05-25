# 接口文档

## 对象

### `ResponseBody`

后端的响应体均由以下类构建：

```ts
/**
 * @class
 * @description HTTP 响应体的标准格式对象
 * */
class ResponseBody<TBody = void>
{
    public readonly isSuccessful: boolean;
    public readonly message?: string;
    public readonly data?: Readonly<TBody>;
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
    public timestamp: number;
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

### `BlockDiff`

```ts
class BlockDiff
{
    public readonly info: string;
    public readonly code: string;
}
```

### `FileDiff`

```ts
class FileDiff
{
    public readonly path: string;
    public readonly isNew: boolean;
    public readonly isDeleted: boolean;
    public readonly isBinary: boolean;
    public readonly blockDiffs: BlockDiff[];
}
```

### `Branch`

```ts
class Branch
{
    public readonly name: string;
    public readonly lastCommit: Commit;
    public readonly isDefault: boolean;
}
```

### `PullRequest`

```ts
 class PullRequest
{
    public readonly id: number | undefined;
    public readonly no: number;
    public readonly sourceRepositoryUsername: string;
    public readonly sourceRepositoryName: string;
    public readonly sourceRepositoryBranchName: string;
    public readonly sourceRepositoryCommitHash: string;
    public readonly targetRepositoryUsername: string;
    public readonly targetRepositoryName: string;
    public readonly targetRepositoryBranchName: string;
    public readonly targetRepositoryCommitHash: string;
    public readonly creationTime: number;
    public readonly modificationTime: number;
    public readonly title: string;
    public readonly content: string;
    public readonly status: PULL_REQUEST_STATUS;
}
```

### `PullRequestComment`

```ts
class PullRequestComment
{
    public readonly id: number | undefined;
    public readonly username: string;
    public readonly belongsTo: number;
    public readonly content: string;
    public readonly creationTime: number;
    public readonly modificationTime: number;
}
```

### `Conflict`

```ts
class Conflict
{
    public readonly filePath: string;
    public readonly isBinary: boolean;
    public readonly content: string;
}
```

### `Issue`

```ts
class Issue
{
    public readonly id: number;
    public readonly username: string;
    public readonly repositoryUsername: string;
    public readonly repositoryName: string;
    public readonly no: number;
    public readonly title: string;
    public readonly status: ISSUE_STATUS;
    public readonly creationTime: number;
    public readonly modificationTime: number;
}
```

### `IssueComment`

```ts
class IssueComment
{
    public readonly id: number;
    public readonly username: number;
    public readonly belongsTo: number;
    public readonly content: string;
    public readonly creationTime: number;
    public readonly modificationTime: number;
}
```

### `CodeComment`

```ts
class CodeComment
{
    public readonly id: number;
    public readonly repositoryUsername: string;
    public readonly repositoryName: string;
    public readonly filePath: string;
    public readonly columnNumber: number;
    public readonly content: string;
    public readonly creatorUsername: string;
    public readonly creationCommitHash: string;
    public readonly creationTimestamp: number;
    public readonly modificationTimestamp: number;
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

### Pull Request Status

```ts
export enum PULL_REQUEST_STATUS
{
    OPEN = 'open',
    CLOSED = 'closed',
    MERGED = 'merged',
}
```

### Issue Status

```ts
enum ISSUE_STATUS
{
    OPEN = 'open',
    CLOSED = 'closed'
}
```

---

## 输入限制

### Account

- 用户名：字母、数字及下划线，1 到 20 位
- 密码：任意非空白字符，6 位以上

### Group

- 名字：任意非空白字符，1 到 20 位

### Profile

- 昵称：任意非空白字符，1 到 20 位
- 邮箱：合法邮箱即可

### Repository

- 名字：字母、数字及下划线，1 到 20 位
- Issue 标题：不能为空
- Issue 评论：不能为空
- Pull Request 标题：不能为空
- Pull Request 评论：不能为空
- 代码批注内容：不能为空

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
- 请求体：`Account`
- 响应体：无
- 响应消息：
  - 200：用户名或密码错误（在账号和密码正确之外的情况返回）
- 其他说明：
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
    verificationCode: string,
}
```
- 响应体：无
- 响应消息：
  - 200：用户名 `${username}` 已存在
  - 200：邮箱 `${email}` 已被使用
  - 200：验证码错误
- 其他说明：无

#### `/sendVerificationCodeToEmail`

- 功能：发送验证码
- 方法：POST
- 请求体：`Pick<Profile, 'email'>`
- 响应体：无
- 响应消息：
  - 200：邮箱 `${email}` 已被使用
- 其他说明：无

#### `/sendVerificationCodeByUsername`

- 功能：发送验证码
- 方法：POST
- 请求体：`Pick<Profile, 'username'>`
- 响应体：无
- 响应消息：
  - 404：用户名 `${username}` 不存在
- 其他说明：无

#### `/changePassword`

- 功能：修改密码
- 方法：POST
- 请求体：
```ts
{
    account: Account,   // hash 域是修改后的新密码
    verificationCode: string,
}
```
- 响应体：无
- 响应消息：
  - 404：用户名 `${username}` 不存在
  - 200：验证码错误
- 其他说明：无

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

#### `/checkPassword`

- 功能：检测当前会话的密码是否正确
- 方法：POST
- 请求体：`Pick<Account, 'hash'>`
- 响应体：
```ts
{
    isCorrect: boolean,
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

### Profile 模块（`/profile`）

本模块负责用户资料的相关操作。

#### `/get`

- 功能：获取用户资料
- 方法：GET
- 请求体：
```ts
{
    json: {
        account?: Pick<Account, 'username'>,
    },
}
```
- 响应体：`Profile | null`
- 响应消息：无
- 其他说明：
  - 如果未提供 `username`，就根据 session 获取
  - 获取不到 `username` 或数据库里没有对应记录，返回 `null`
  - 本请求不会有失败情况

#### `/getByEmail`

- 功能：根据邮箱获取用户资料
- 方法：GET
- 请求体：
```ts
{
    json: {
        email: string,
    },
}
```
- 响应体：`Profile | null`
- 响应消息：无
- 其他说明：无

#### `/setNickname`

- 功能：修改用户昵称
- 方法：POST
- 请求体：`Pick<Profile, 'nickname'>`
- 响应体：无
- 响应消息：无
- 其他说明：
  - 修改 Session 对应的账号资料

#### `/setEmail`

- 功能：修改用户邮箱
- 方法：POST
- 请求体：
```ts
{
    email: Profile['email'],
    verificationCode: string,
}
```
- 响应体：无
- 响应消息：
  - 200：邮箱 `${email}` 已被使用
- 其他说明：
  - 修改 Session 对应的账号邮箱

#### `/sendSetEmailVerificationCodeToEmail`

- 功能：发送验证码
- 方法：POST
- 请求体：`Pick<Profile, 'email'>`
- 响应体：无
- 响应消息：
  - 200：邮箱 `${email}` 已被使用
- 其他说明：无

#### `/uploadAvatar`

- 功能：上传头像
- 方法：POST
- 请求体：`FormData`，头像数据保存在 `avatar` 键中
- 响应体：无
- 响应消息：无
- 其他说明：
  - 修改 Session 对应的账号头像

### Git 模块

Git 模块供普通 Git 命令行指令调用。在前端不会使用到以下请求。各个请求的详细作用见[这篇文章](https://soulike.tech/article?id=43)。模块中对各个请求增加了权限判断。

#### `/[username]/[repositoryName].git/info/refs`

- 其他说明：
  - 对公有库
    - 所有人都可执行 `git-upload-pack`
    - 只有具有权限的人才能执行 `git-receive-pack`，否则返回 403
  - 对私有库
    - 如果请求人不是仓库所有者，返回 404

#### `/[username]/[repositoryName].git/git-[command]`

- 其他说明：
  - 对公有库
    - 所有人都可执行 `git-upload-pack`
    - 只有具有权限的人才能执行 `git-receive-pack`，否则返回 403
  - 对私有库
    - 如果请求人不是仓库所有者，返回 404

#### `/[username]/[repositoryName].git/[filePath]`

- 其他说明：
  - 对公有库
    - 所有人都可获取文件
  - 对私有库
    - 仅具有权限的人才能获取仓库文件，否则返回 404

### Repository 模块（`/repository`）

本模块负责执行 Git 仓库的相关操作。

#### `/getRepositories`

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
- 响应体：`Repository[]`
- 响应消息：无
- 其他说明：
  - 如果登录人与仓库所有者不是同一个人，只返回公有仓库
  - 如果登录人与仓库所有者是同一个人，公私有仓库均返回
  - 数据库中剩余多少条就返回多少条

#### `/create`

- 功能：创建新的仓库
- 方法：POST
- 请求体：`Omit<RepositoryClass, 'username'>`
- 响应体：无
- 响应消息：
  - 200：仓库 `${username}/${name}` 已存在
- 其他说明：无

#### `/del`

- 功能：删除仓库
- 方法：POST
- 请求体：`Pick<Repository, 'name'>`
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/fork`

- 功能：复刻仓库
- 方法：POST
- 请求体：`Pick<Repository, 'username' | 'name'>`
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 200：已存在同名仓库 `${username}/${name}`
  - 200：不能 fork 私有仓库
  - 200：不能 fork 自己的仓库
- 其他说明：无

#### `/isMergeable`

- 功能：查看两仓库分支是否可自动合并
- 方法：GET
- 请求体：
```ts
{
    sourceRepository: Pick<Repository, 'username'|'name'>,
    sourceRepositoryBranchName: string,
    targetRepository: Pick<Repository, 'username'|'name'>,
    targetRepositoryBranchName: string,
}
```
- 响应体：
```ts
{
    isMergeable: boolean,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：仓库 `${username}/${name}` 分支 `${branch}` 不存在
- 其他说明：无

### RepositoryInfo 模块（`/repositoryInfo`）

本模块负责执行 Git 仓库内容信息操作。

*注：对无权限访问的仓库，响应表现与仓库不存在相同。*

#### `/repository`

- 功能：获取仓库基本信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        account: Pick<Account, 'username'>,
        repository: Pick<Repository, 'name'>,
    }
}
```
- 响应体：`Repository | null`
- 响应消息：无
- 其他说明：无

#### `/branches`

- 功能：获取仓库分支列表
- 方法：GET
- 请求参数：
```ts
{
    json: {
        repository: Pick<Repository, 'username' | 'name'>,
    },
}
```
- 响应体：
```ts
{
    branches: Branch[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/branchNames`

- 功能：获取仓库分支名称列表
- 方法：GET
- 请求参数：
```ts
{
    json: {
        repository: Pick<Repository, 'username' | 'name'>,
    },
}
```
- 响应体：
```ts
{
    branchNames: string[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/lastBranchCommit`

- 功能：获取仓库分支（文件）最后一次提交信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        account: Pick<Account, 'username'>,
        repository: Pick<Repository, 'name'>,
        branch: string,
        filePath?: string,      // 文件，相对路径
    }
}
```
- 响应体：`Commit` 类实例
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：分支 `${branch}` 不存在
  - 404：分支或文件不存在
- 其他说明：无

#### `/lastCommit`

- 功能：获取仓库最后一次提交信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        repository: Pick<Repository, 'username' | 'name'>,
    }
}
```
- 响应体：`Commit | null`
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：
  - 当仓库从未提交时返回 `null`

#### `/directory`

- 功能：获取仓库某目录所有文件/目录的信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        account: Pick<Account, 'username'>,
        repository: Pick<Repository, 'name'>,
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
  - 404：仓库 `${username}/${name}` 不存在
  - 404：文件或目录不存在
- 其他说明：
  - 对数组进行排序，类型为 TREE 的在前，BLOB 的在后

#### `/commitCount`

- 功能：获取仓库提交次数
- 方法：GET
- 请求参数：
```ts
{
    json: {
        account: Pick<Account, 'username'>,
        repository: Pick<Repository, 'name'>,
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
  - 404：仓库 `${username}/${name}` 不存在
  - 404：分支或提交不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404
  - 如果是空仓库，提交次数返回 0

#### `/commitCountBetweenCommits`

- 功能：获取仓库两次提交之间提交次数
- 方法：GET
- 请求参数：
```ts
{
    json: {
        repository: Pick<Repository, 'username' | 'name'>,
        baseCommitHash: string,
        targetCommitHash: string,
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
  - 404：仓库 `${username}/${name}` 不存在
  - 404：分支或提交不存在
- 其他说明：
  - 如果是空仓库，提交次数返回 0

#### `/fileInfo`

- 功能：获取指定文件信息
- 方法：GET
- 请求参数：
```ts
{
    json: {
        account: Pick<Account, 'username'>,
        repository: Pick<Repository, 'name'>,
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
  - 404：仓库不存在
  - 404：分支或提交不存在
- 其他说明：
  - 在文件不存在时，不返回 404

#### `/rawFile`

- 功能：获取文件内容
- 方法：GET
- 请求参数：
```ts
{
    json: {
        account: Pick<Account, 'username'>,
        repository: Pick<Repository, 'name'>,
        filePath: string,           // 文件相对仓库目录的路径
        commitHash: string,         // commit hash 值
    }
}
```
- 响应体：二进制文件流
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：分支、提交或文件不存在
  - 404：分支或提交不存在
- 其他说明：
  - 如果仓库是私有的，不是本人请求就返回 HTTP 404
  - 直接调用标准输出流和响应流进行发送

#### `/setName`

- 功能：修改仓库名
- 方法：POST
- 请求参数：
```ts
{
    repository: Pick<Repository, 'name'>,
    newRepository: Pick<Repository, 'name'>,
}
```
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 200：仓库 `${username}/${name}` 已存在
- 其他说明：无

#### `/setDescription`

- 功能：修改仓库描述
- 方法：POST
- 请求参数：
```ts
{
    repository: Pick<Repository, 'name' | 'description'>,
}
```
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/setIsPublic`

- 功能：修改仓库可见性
- 方法：POST
- 请求参数：
```ts
{
    repository: Pick<Repository, 'name' | 'isPublic'>
}
```
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：
  - 仓库从公开改为私有清空所有 star

#### `/commitHistoryBetweenCommits`

- 功能：获取两个提交之间的提交历史
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    baseCommitHash: string,
    targetCommitHash: string,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    commits: Commit[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：无

#### `/commitHistory`

- 功能：获取仓库某个提交以来的提交历史
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    targetCommitHash: string,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    commits: Commit[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：无

#### `/fileCommitHistoryBetweenCommits`

- 功能：获取某个文件两个提交之间的提交历史
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    filePath: string,
    baseCommitHash: string,
    targetCommitHash: string,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    commits: Commit[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交或文件不存在
- 其他说明：无

#### `/fileCommitHistory`

- 功能：获取某个文件某个提交以来的提交历史
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    filePath: string,
    targetCommitHash: string,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    commits: Commit[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交或文件不存在
- 其他说明：无

#### `/diffBetweenCommits`

- 功能：获取两个提交之间的差异信息
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    baseCommitHash: string,
    targetCommitHash: string,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    diff: FileDiff[],
}
```
- 响应消息
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：无

#### `/diffAmountBetweenCommits`

- 功能：获取两个提交之间的差异文件个数
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    baseCommitHash: string,
    targetCommitHash: string,
}
```
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：无

#### `/fileDiffBetweenCommits`

- 功能：获取某个文件在两个提交之间的差异信息
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    filePath: string,
    baseCommitHash: string,
    targetCommitHash: string,
}
```
- 响应体：
```ts
{
    diff: FileDiff,
}
```
- 响应消息
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交或文件不存在
- 其他说明：无

#### `/commit`

- 功能：获取某次提交的信息
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    commitHash: string,
}
```
- 响应体：
```ts
{
    commit: Commit,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：无

#### `/commitDiff`

- 功能：获取某次提交的文件差异
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    commitHash: string,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    diff: FileDiff[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：无

#### `/commitDiffAmount`

- 功能：获取某次提交的文件差异数量
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    commitHash: string,
}
```
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：无

#### `/fileCommit`

- 功能：获取某个文件某次提交的信息
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username', 'name'>,
    commitHash: string,
    filePath: string,
}
```
- 响应体：
```ts
{
    commit: Commit,
    diff: FileDiff,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交或文件不存在
- 其他说明：无

#### `/forkAmount`

- 功能：获取本仓库被复刻数量
- 方法：GET
- 请求体：`Pick<Repository, 'username' | 'name'>`
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/forkRepositories`

- 功能：获取由本仓库复刻的仓库列表
- 方法：GET
- 请求体：`Pick<Repository, 'username' | 'name'>`
- 响应体：
```ts
{
    repositories: Repository[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/forkFrom`

- 功能：获取仓库的复刻源仓库
- 方法：GET
- 请求体：`Pick<Repository, 'username' | 'name'>`
- 响应体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'> | null,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：
  - 如果仓库不是复刻得到则返回 `null`

#### `/forkCommitHistory`

- 功能：获取有 fork 关系两仓库分支之间的提交差异
- 方法：GET
- 请求体：
```ts
{
    sourceRepository: Pick<Repository, 'username' | 'name'>,
    sourceRepositoryBranch: string,
    targetRepository: Pick<Repository, 'username' | 'name'>,
    targetRepositoryBranch: string,
    offset: number,
    limit: number,
    
}
```
- 响应体：
```ts
{
    commits: Commit[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：`${username}/${name}` 的分支 `${branch}` 不存在
- 其他说明：无

#### `/forkCommitAmount`

- 功能：获取 Fork 仓库分支之间提交次数
- 方法：GET
- 请求参数：
```ts
{
    json: {
        sourceRepository: Pick<Repository, 'username' | 'name'>,
        sourceRepositoryBranch: string,
        targetRepository: Pick<Repository, 'username' | 'name'>,
        targetRepositoryBranch: string,
    }
}
```
- 响应体：
```ts
{
    commitAmount: number,    // 指定分支的提交次数
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：`${username}/${name}` 的分支 `${branch}` 不存在
- 其他说明：无

#### `/forkFileDiff`

- 功能：获取有 fork 关系两仓库分支之间的文件差异
- 方法：GET
- 请求体：
```ts
{
    sourceRepository: Pick<Repository, 'username' | 'name'>,
    sourceRepositoryBranch: string,
    targetRepository: Pick<Repository, 'username' | 'name'>,
    targetRepositoryBranch: string,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    fileDiffs: FileDiff[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：`${username}/${name}` 的分支 `${branch}` 不存在
- 其他说明：无

#### `/forkFileDiffAmount`

- 功能：获取有 fork 关系两仓库分支之间的文件差异数量
- 方法：GET
- 请求体：
```ts
{
    sourceRepository: Pick<Repository, 'username' | 'name'>,
    sourceRepositoryBranch: string,
    targetRepository: Pick<Repository, 'username' | 'name'>,
    targetRepositoryBranch: string,
}
```
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：`${username}/${name}` 的分支 `${branch}` 不存在
- 其他说明：无

#### `/hasCommonAncestor`

- 功能：判断两个仓库分支之间是否有共同的提交祖先
- 方法：GET
- 请求体：
```ts
{
    sourceRepository: Pick<Repository, 'username' | 'name'>,
    sourceRepositoryBranchName: string,
    targetRepository: Pick<Repository, 'username' | 'name'>,
    targetRepositoryBranchName: string,
}
```
- 响应体：
```ts
{
    hasCommonAncestor: boolean,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：`${username}/${name}` 的分支 `${branch}` 不存在
- 其他说明：无

### Group 模块（`/group`）

#### `/add`

- 功能：创建小组
- 方法：POST
- 请求体：
```ts
{
    group: Omit<Group, 'id'>
}
```
- 响应体：`Pick<Group, 'id'>`
- 响应消息：
  - 200：已存在同名小组
- 其他说明：无

#### `/dismiss`

- 功能：解散小组
- 方法：POST
- 请求体：
```ts
{
    group: Omit<Group, 'id'>
}
```
- 响应体：无
- 响应消息：
  - 200：您不是小组 #`${id}` 的管理员
- 其他说明：无

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
- 响应体：`Group | null`
- 响应消息：无
- 其他说明：无

#### `/changeName`

- 功能：修改小组名
- 方法：POST
- 请求体：`Pick<Group, 'id' | 'name'>`
- 响应体：无
- 响应消息：
  - 404：小组 #`${id}` 不存在
  - 200：您不是小组 #`${id}` 的管理员
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
  - 404：小组 #`${id}` 不存在
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
  - 404：小组 #`${id}` 不存在
  - 404：用户 `${username}` 不存在
  - 200：您不是小组 #`${id}` 的管理员
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
  - 404：小组 #`${id}` 不存在
  - 200：不能从小组中移除自己
  - 200：您不是小组 #`${id}` 的管理员
- 其他说明：
  - 仅小组管理员删除请求有效，其他人均权限不足
  - 管理员不能移除自己

#### `/getByAccount`

- 功能：获取账号所属小组
- 方法：GET
- 请求体：
```ts
{
    json: Pick<Account, 'username'>,
}
```
- 响应体：`Group[]`
- 响应消息：
  - 404：用户 ${username} 不存在
- 其他说明：无

#### `/getAdministratingByAccount`

- 功能：获取账号管理的小组
- 方法：GET
- 请求体：
```ts
{
    json: Pick<Account, 'username'>,
}
```
- 响应体：`Group[]`
- 响应消息：
  - 404：用户 `${username}` 不存在
- 其他说明：无

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
  - 404：小组 #`${id}` 不存在
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
  - 404：小组 #`${id}` 不存在
  - 404：用户 `${username}` 不存在
  - 200：用户 `${username}` 不是小组 #`${id}` 的成员
  - 200：您不是小组 #`${id}` 的管理员
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
  - 404：小组 #`${id}` 不存在
  - 200：不能撤销自己的管理员权限
  - 200：您不是小组 #`${id}` 的管理员
- 其他说明：
  - 仅小组管理员删除请求有效，其他人均权限不足

#### `/isAdmin`

- 功能：确定请求者是否是管理员
- 方法：GET
- 请求体：
```ts
{
    json: {
        group: Pick<Group, 'id'>,
    }
}
```
- 响应体：
```ts
{
    isAdmin: boolean,
}
```
- 响应消息：
  - 404：小组 #`${id}` 不存在
- 其他说明：无

#### `/getByRepository`

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
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/repositories`

- 功能：获取小组仓库信息
- 方法：GET
- 请求体：
```ts
{
    json: {
        group: Pick<Group, 'id'>,
    }
}
```
- 响应体：`Repository[]`
- 响应消息：
  - 404：小组 #`${id}` 不存在
- 其他说明：无

#### `/addRepository`

- 功能：添加小组仓库
- 方法：POST
- 请求体：
```ts
{
    group: Pick<Group, 'id'>,
    repository: Pick<Repository, 'username' | 'name'>,
}
```
- 响应体：无
- 响应消息：
  - 404：小组 #`${id}` 不存在
  - 404：仓库 `${username}/${name}` 不存在
  - 200：仓库 `${username}/${name}` 的创建者不是小组 #`${id}` 的成员
  - 200：您不是小组 #`${id}` 的管理员或仓库 `${username}/${name}` 的创建者
  - 200：仓库 `${username}/${name}` 已存在于小组 #`${id}` 中
- 其他说明：
  - 只有小组的管理员或仓库的创建者可以执行本操作

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
  - 404：小组 `${username}/${name}` 不存在
  - 404：仓库 `${name}` 不存在
  - 200：您不是小组 #`${id}` 的管理员
- 其他说明：
  - 只有小组的管理员可以执行本操作

### Star 模块（`/star`）

#### `/add`

- 功能：添加收藏仓库
- 方法：POST
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
}
```
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：
  - 如果仓库已经被收藏，则返回成功
  - 如果仓库是不可访问的，返回仓库不存在

#### `/remove`

- 功能：删除收藏仓库
- 方法：POST
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
}
```
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：
  - 如果仓库已经被删除收藏，则返回成功
  - 如果仓库是不可访问的，也执行删除

#### `/getStaredRepositories`

- 功能：获取收藏的仓库
- 方法：GET
- 请求体：
```ts
{
    account?: Pick<Account, 'username'>,  // 优先级高于从会话获取
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    repositories: Repository[],
}
```
- 响应消息：无
- 其他说明：无

#### `/getStaredRepositoriesAmount`

- 功能：获取收藏的仓库数量
- 方法：GET
- 请求体：
```ts
{
    account?: Pick<Account, 'username'>,  // 优先级高于从会话获取
}
```
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：无
- 其他说明：无

#### `/isStaredRepository`

- 功能：获取仓库是否被收藏
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
}
```
- 响应体：
```ts
{
    isStared: boolean,
}
```
- 响应消息：无
- 其他说明：无

#### `/getRepositoryStarAmount`

- 功能：获取仓库被收藏数
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
}
```
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：  
  - 如果仓库是不可访问的，返回仓库不存在

#### `/getRepositoryStarUsers`

- 功能：获取仓库收藏账号列表
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
}
```
- 响应体：
```ts
{
    users: Profile[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：
  - 如果仓库是不可访问的，返回仓库不存在

### Collaborate 模块（`/collaborate`）

#### `/generateCode`

- 功能：生成仓库合作邀请码
- 方法：GET
- 请求体：
```ts
{
    json: {
        repository: Pick<Repository, 'username' | 'name'>
    }
}
```
- 响应体：
```ts
{
    code: string,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 200：只有仓库 `${username}/${name}` 的创建者可以生成邀请码
- 其他说明：
  - 只有仓库创建者可以生成邀请码
  - 生成代码格式：`[username]_[repositoryName]_[Date.now()]`
  - 代码有效时间 7 天
  - 一个代码只能被一人使用，用后作废

#### `/add`

- 功能：仓库添加合作者
- 方法：POST
- 请求体：
```ts
{
    code: string,
}
```
- 响应体：无
- 响应消息：
  - 200：邀请码无效
  - 404：用户 `${username}` 不存在
  - 200：不能添加自己为合作者
  - 200：用户 `${username}` 已是仓库 `${username}/${name}` 的合作者
- 其他说明：无

#### `/remove`

- 功能：仓库删除合作者
- 方法：POST
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    account: Pick<Account, 'username'>
}
```
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：用户 `${username}` 不存在
- 其他说明：
  - 如果被移除的用户不是合作者，也返回成功
  - 只有可修改仓库的人有权限

#### `/getCollaborators`

- 功能：获取仓库合作者列表
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>, 
}
```
- 响应体：
```ts
{
    collaborators: Profile[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/getCollaboratorsAmount`

- 功能：获取仓库合作者数量
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>, 
}
```
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/getCollaboratingRepositories`

- 功能：获取作为合作者的仓库列表
- 方法：GET
- 请求体：
```ts
{
    account?: Pick<Account, 'username'>,  // 优先级高于从会话获取
}
```
- 响应体：
```ts
{
    repositories: Repository[]
}
```
- 响应消息：
  - 404：用户 ${username} 不存在
- 其他说明：无

#### `/getCollaboratingRepositoriesAmount`

- 功能：获取作为合作者的仓库数量
- 方法：GET
- 请求体：
```ts
{
    account?: Pick<Account, 'username'>,  // 优先级高于从会话获取
}
```
- 响应体：
```ts
{
    amount: number
}
```
- 响应消息：
  - 404：用户 ${username} 不存在
- 其他说明：无

### Pull Request 模块（`/pullRequest`）

#### `/add`

- 功能：添加 Pull Request
- 方法：POST
- 请求体：`Omit<PullRequest, 'id' | 'no' | 'sourceRepositoryCommitHash' | 'targetRepositoryCommitHash' | 'creationTime' | 'modificationTime' | 'status'>`
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：`${username}/${name}` 分支 `${branch}` 不存在
  - 404：`${username}/${name}` 不是 `${username}/${name}` 的 fork
  - 404：只有源仓库 `${username}/${name}` 的创建者才可创建 Pull Request
- 其他说明：无

#### `/update`

- 功能：修改 Pull Request
- 方法：POST
- 请求体：
```ts
{
    primaryKey: Pick<PullRequest, 'id'>,
    pullRequest: Partial<Pick<PullRequest, 'title' | 'content'>>
}
```
- 响应体：无
- 响应消息：
  - 404：Pull Request 不存在
  - 200：只有 Pull Request #`${no}` 的创建者可进行修改
- 其他说明：无

#### `/close`

- 功能：关闭 Pull Request
- 方法：POST
- 请求体：`Pick<PullRequest, 'id'>`
- 响应体：无
- 响应消息：
  - 404：Pull Request 不存在
  - 200：只有目标仓库 `${username}/${name}` 的合作者或 Pull Request #`${no}` 的创建者可关闭 Pull Request
- 其他说明：无

#### `/reopen`

- 功能：重新开启 Pull Request
- 方法：POST
- 请求体：`Pick<PullRequest, 'id'>`
- 响应体：无
- 响应消息：
  - 404：Pull Request 不存在
  - 200：只有目标仓库 `${username}/${name}` 的合作者和 Pull Request #`${no}` 的创建者可重开 Pull Request
  - 404：仓库 `${username}/${name}` 已不存在
  - 404：`${username}/${name}` 分支 `${branch}` 已不存在
- 其他说明：无

#### `/isMergeable`

- 功能：查看 Pull Request 是否可自动合并
- 方法：GET
- 请求体：`Pick<PullRequest, 'id'>`
- 响应体：
```ts
{
    isMergeable: boolean,
}
```
- 响应消息：
  - 404：Pull Request 不存在
  - 404：`${username}/${name}` 分支 `${branch}` 不存在
  - 404：Pull Request 已关闭
- 其他说明：无

#### `/merge`

- 功能：合并 Pull Request
- 方法：POST
- 请求体：`Pick<PullRequest, 'id'>`
- 响应体：无
- 响应消息：
  - 404：Pull Request 不存在
  - 200：Pull Request #`${no}` 存在冲突，请解决冲突后再合并
  - 404：`${username}/${name}` 分支 `${branch}` 不存在
  - 200：Pull Request 已关闭
  - 200：只有目标仓库 `${username}/${name}` 的合作者可合并 Pull Request #`${no}`
- 其他说明：无

#### `/get`

- 功能：获取一个 Pull Request 的信息
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    pullRequest: Pick<PullRequest, 'no'>,
}
```
- 响应体：`PullRequest | null`
- 响应消息：无
- 其他说明：无

#### `/getByRepository`

- 功能：获取一个仓库的 Pull Request
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    status: PULL_REQUEST_STATUS | undefined, // undefined 是没有筛选条件
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    pullRequests: PullRequest[]
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/getPullRequestAmount`

- 功能：获取仓库不同状态 Pull Request 的个数
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    status: PULL_REQUEST_STATUS | undefined, // undefined 是没有筛选条件
}
```
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/addComment`

- 功能：对 Pull Request 添加评论
- 方法：POST
- 请求体：`Omit<PullRequestComment, 'id' | 'username' | 'creationTime' | 'modificationTime'>`
- 响应体：无
- 响应消息：
  - 404：Pull Request 不存在
  - 200 Request #`${no}` 已关闭
- 其他说明：无

#### `/updateComment`

- 功能：修改评论
- 方法：POST
- 请求体：
```ts
{
    primaryKey: Pick<PullRequestComment, 'id'>,
    pullRequestComment: Pick<PullRequestComment, 'content'>,
}
```
- 响应体：无
- 响应消息：
  - 404：Pull Request 不存在
  - 200：仅本人可编辑评论
- 其他说明：无

#### `/getComments`

- 功能：获取 Pull Request 的评论
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    pullRequest: Pick<PullRequest, 'no'>,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    comments: PullRequestComment[],
}
```
- 响应消息：
  - 404：Pull Request 不存在
- 其他说明：无

#### `/getConflicts`

- 功能：获取 Pull Request 合并存在的冲突
- 方法：GET
- 请求体：`Pick<PullRequest, 'id'>`
- 响应体：
```ts
{
    conflicts: Conflict[],
}
```
- 响应消息：
  - 404：Pull Request 不存在
  - 200：Pull Request #`${no}` 已关闭
- 其他说明：无

#### `/resolveConflicts`

- 功能：解决 Pull Request 合并存在的冲突
- 方法：POST
- 请求体：
```ts
{
    pullRequest: Pick<PullRequest, 'id'>,
    conflicts: Conflict[],
}
```
- 响应体：无
- 响应消息：
  - 404：Pull Request 不存在
  - 200：存在二进制文件冲突，请使用命令行解决
  - 200：只有 Pull Request #`${no}` 的创建者可解决冲突
  - 200：Pull Request #`${no}` 已关闭
- 其他说明：无

#### `/getCommits`

- 功能：获取 Pull Request 的提交历史
- 方法：GET
- 请求体：
```ts
{
    pullRequest: Pick<PullRequest, 'id'>,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    commits: Commit[],
}
```
- 响应消息：
  - 404：Pull Request 不存在
- 其他说明：无

#### `/getCommitAmount`

- 功能：获取 Pull Request 的提交次数
- 方法：GET
- 请求体：`Pick<PullRequest, 'id'>`
- 响应体：
```ts
{
    commitAmount: number,
}
```
- 响应消息：
  - 404：Pull Request 不存在
- 其他说明：无

#### `/getFileDiffs`

- 功能：获取 Pull Request 的文件差异
- 方法：GET
- 请求体：
```ts
{
    pullRequest: Pick<PullRequest, 'id'>,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    fileDiffs: FileDiff[],
}
```
- 响应消息：
  - 404：Pull Request 不存在
- 其他说明：无

#### `/getFileDiffAmount`

- 功能：获取 Pull Request 的文件差异数量
- 方法：GET
- 请求体：`Pick<PullRequest, 'id'>`
- 响应体：
```ts
{
    amount: number,
}
```
- 响应消息：
  - 404：Pull Request 不存在
- 其他说明：无

### Issue 模块（`/issue`）

#### `/add`

- 功能：添加新 Issue
- 方法：POST
- 请求体：
```ts
{
    issue: Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'title'>,
    issueComment: Pick<IssueComment, 'content'>,
}
```
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/close`

- 功能：关闭 Issue
- 方法：POST
- 请求体：`Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>`
- 响应体：无
- 响应消息：
  - 404：Issue #`${no}` 不存在
  - 400：只有仓库 `${username}/${name}` 的合作者与 Issue #`${no}` 的创建者可关闭 Issue
- 其他说明：无

#### `/reopen`

- 功能：重新开启 Issue
- 方法：POST
- 请求体：`Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>`
- 响应体：无
- 响应消息：
  - 404：Issue #`${no}` 不存在
  - 200：只有仓库 ${username}/${name} 的合作者与 Issue #`${no}` 的创建者可开启 Issue
- 其他说明：无

#### `/getByRepository`

- 功能：获取仓库的 Issue 列表
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    status: ISSUE_STATUS | undefined,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    issues: Issue[],
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：
  - 按照创建时间从晚到早排序

#### `/getAmountByRepository`

- 功能：获取仓库的 Issue 数量
- 方法：GET
- 请求体：
```ts
{
    repository: Pick<Repository, 'username' | 'name'>,
    status: ISSUE_STATUS | undefined,
}
```
- 响应体：
```ts
{
    amount: number,   
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/get`

- 功能：获取 Issue 信息
- 方法：GET
- 请求体：`Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>`
- 响应体：`Issue | null`
- 响应消息：无
- 其他说明：无

#### `/getComments`

- 功能：获取 Issue 的评论
- 方法：GET
- 请求体：
```ts
{
    issue: Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>,
    offset: number,
    limit: number,
}
```
- 响应体：
```ts
{
    comments: IssueComment[],
}
```
- 响应消息：
  - 404：Issue #`${no}` 不存在
- 其他说明：
  - 按照创建时间从早到晚排序

#### `/addComment`

- 功能：添加 Issue 评论
- 方法：POST
- 请求体：
```ts
{
    issue: Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>,
    issueComment: Pick<IssueComment, 'content'>,
}
```
- 响应体：无
- 响应消息：
  - 404：Issue #`${no}` 不存在
- 其他说明：无

### CodeComment 模块（`/codeComment`）

#### `/add`

- 功能：添加代码批注
- 方法：POST
- 请求体：`Pick<CodeComment, 'repositoryUsername' | 'repositoryName' | 'filePath' | 'columnNumber' | 'content' | 'creationCommitHash'>`
- 响应体：无
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
- 其他说明：无

#### `/del`

- 功能：删除代码批注
- 方法：POST
- 请求体：`Pick<CodeComment, 'id'>`
- 响应体：无
- 响应消息：
  - 404：代码批注不存在
  - 200：只有仓库的合作者或代码批注的创建者可以删除代码批注
- 其他说明：
  - 只有仓库的合作者或代码批注的创建者可以删除代码批注

#### `/get`

- 功能：获取某文件（的某行）的所有代码批注
- 方法：GET
- 请求体：
```ts
{
    codeComment: Pick<CodeComment, 'repositoryUsername' | 'repositoryName' | 'filePath'> & Partial<Pick<CodeComment, 'columnNumber'>>
    commitHash: string, // 当前文件的提交 hash
}
```
- 响应体：
```ts
{
    codeComments: CodeComment[]
}
```
- 响应消息：
  - 404：仓库 `${username}/${name}` 不存在
  - 404：提交不存在
- 其他说明：
  - 访问权限规则同 RepositoryInfo 模块
  - 只提供 `commitHash` 对应提交的批注

#### `/update`

- 功能：修改代码批注内容
- 方法：POST
- 请求体：
```ts
{
    codeComment: Pick<CodeComment, 'content'>,
    primaryKey: Pick<CodeComment, 'id'>,
}
```
- 响应体：无
- 响应消息：
  - 404：代码批注不存在
  - 200：只有代码批注创建者可以修改此批注
- 其他说明：
  - 只有代码批注创建者可以修改批注