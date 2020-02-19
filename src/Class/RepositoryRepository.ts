export class RepositoryRepository
{
    public readonly sourceRepositoryUsername: string;
    public readonly sourceRepositoryName: string;
    public readonly targetRepositoryUsername: string;
    public readonly targetRepositoryName: string;

    constructor(sourceRepositoryUsername: string, sourceRepositoryName: string, targetRepositoryUsername: string, targetRepositoryName: string)
    {
        this.sourceRepositoryUsername = sourceRepositoryUsername;
        this.sourceRepositoryName = sourceRepositoryName;
        this.targetRepositoryUsername = targetRepositoryUsername;
        this.targetRepositoryName = targetRepositoryName;
    }

    public static validate(repositoryRepository: Readonly<Record<keyof RepositoryRepository, any>>): boolean
    {
        const {
            sourceRepositoryUsername, sourceRepositoryName,
            targetRepositoryUsername, targetRepositoryName,
        } = repositoryRepository;
        return typeof sourceRepositoryUsername === 'string'
            && typeof sourceRepositoryName === 'string'
            && typeof targetRepositoryUsername === 'string'
            && typeof targetRepositoryName === 'string';
    }

    public static from(repositoryRepository: Readonly<Record<keyof RepositoryRepository, any>>): RepositoryRepository
    {
        if (!RepositoryRepository.validate(repositoryRepository))
        {
            throw new TypeError();
        }
        const {
            sourceRepositoryUsername, sourceRepositoryName,
            targetRepositoryUsername, targetRepositoryName,
        } = repositoryRepository;
        return new RepositoryRepository(
            sourceRepositoryUsername, sourceRepositoryName,
            targetRepositoryUsername, targetRepositoryName,
        );
    }
}