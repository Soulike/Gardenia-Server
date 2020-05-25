import {CodeComment, ResponseBody, ServiceResponse} from '../Class';
import {
    CodeComment as CodeCommentTable,
    Collaborate as CollaborateTable,
    Repository as RepositoryTable,
} from '../Database';
import {Repository as RepositoryFunction} from '../Function';
import {SERVER} from '../CONFIG';
import {ILoggedInSession, ISession} from '../Interface';

export async function add(codeComment: Readonly<Pick<CodeComment, 'repositoryUsername' | 'repositoryName' | 'filePath' | 'columnNumber' | 'content' | 'creationCommitHash'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {repositoryUsername, repositoryName, filePath, creationCommitHash, content, columnNumber} = codeComment;
    const repository = await RepositoryTable.selectByUsernameAndName({
        username: repositoryUsername,
        name: repositoryName,
    });
    if (repository === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repositoryUsername}/${repositoryName} 不存在`));
    }
    const timestamp = Date.now();
    await CodeCommentTable.insert({
        repositoryUsername,
        repositoryName,
        filePath,
        creationCommitHash,
        content,
        columnNumber,
        creatorUsername: usernameInSession,
        modificationTimestamp: timestamp,
        creationTimestamp: timestamp,
    });
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function del(codeComment: Readonly<Pick<CodeComment, 'id'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {id} = codeComment;
    const codeCommentInDatabase = await CodeCommentTable.selectById({id});
    if (codeCommentInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '代码批注不存在'));
    }
    const {repositoryUsername, repositoryName, creatorUsername} = codeCommentInDatabase;
    // repository 一定存在
    const accountRepositories = await CollaborateTable.select({repositoryUsername, repositoryName});
    const collaborators = accountRepositories.map(({username}) => username);
    if (usernameInSession !== repositoryUsername        // 不是仓库创建者
        && !collaborators.includes(usernameInSession)   // 不是仓库合作者
        && usernameInSession !== creatorUsername)       // 不是批注创建者
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有仓库的合作者或代码批注的创建者可以删除代码批注'));
    }
    await CodeCommentTable.del({id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function get(codeComment: Readonly<Pick<CodeComment, 'repositoryUsername' | 'repositoryName' | 'filePath'> & Partial<Pick<CodeComment, 'columnNumber'>>>, commitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ codeComments: CodeComment[] } | void>>
{
    const {repositoryUsername, repositoryName, filePath, columnNumber} = codeComment;
    const repository = await RepositoryTable.selectByUsernameAndName({
        username: repositoryUsername,
        name: repositoryName,
    });
    if (repository === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repositoryUsername}/${repositoryName} 不存在`));
    }
    try
    {
        const codeComments = await CodeCommentTable.selectByRepositoryAndFilePath({
            repositoryUsername,
            repositoryName,
            filePath,
            columnNumber,
            creationCommitHash: commitHash,
        });
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {codeComments}));
    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `提交不存在`));
    }
}

export async function update(codeComment: Readonly<Pick<CodeComment, 'content'>>, primaryKey: Readonly<Pick<CodeComment, 'id'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {content} = codeComment;
    const {id} = primaryKey;
    const codeCommentInDatabase = await CodeCommentTable.selectById({id});
    if (codeCommentInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '代码批注不存在'));
    }
    const {creatorUsername} = codeCommentInDatabase;
    if (creatorUsername !== usernameInSession)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有代码批注创建者可以修改此批注'));
    }
    const now = Date.now();
    await CodeCommentTable.update({content, modificationTimestamp: now}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}