export const ADVERTISE = /\/(.+)\/(.+)\.git\/info\/refs/;   // /username/repositoryName.git/info/refs
export const RPC = /\/(.+)\/(.+)\.git\/git-([\w\-]+)/;  // /username/repositoryName.git/git-xxx
export const FILE = /\/(.+)\/(.+)\.git\/((?:.+)\/?)+/;  // /username/repositoryName.git/xxx