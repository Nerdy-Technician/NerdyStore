interface ShellResult {
    success: boolean;
    exitCode: number;
    stdout: string;
    stderr: string;
}

interface FetchResponse {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    text(): string;
    json(): any;
}

interface FetchOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
    headers?: Record<string, string>;
    body?: string;
}

interface DirEntry {
    name: string;
    isFile: boolean;
    isDirectory: boolean;
}

interface PortMapping {
    host: string;
    container: string;
}

interface ComposeUpOptions {
    detach?: boolean;
    force_recreate?: boolean;
}

declare const context: {
    appName: string;
    appVersion: string;
    slug: string;
    source: string;
    directory: string;
    hook: string;
    config: Record<string, string>;
};

declare const console: {
    log(...args: any[]): void;
};

declare function shell(command: string): string;
declare function shellWithArgs(command: string, argsJson: string): string;
declare function sleep(ms: number): void;
declare function fetch(url: string, options?: FetchOptions): FetchResponse;
declare function success(data?: any): string;
declare function fail(error?: any): string;

declare const fs: {
    readFile(path: string): string;
    writeFile(path: string, content: string): true;
    appendFile(path: string, content: string): true;
    deleteFile(path: string): true;
    exists(path: string): boolean;
    readdir(path: string): DirEntry[];
    mkdir(path: string): true;
};

declare const env: {
    load(file: string): Record<string, string>;
    get(file: string, key: string): string | null;
    set(file: string, key: string, value: string): true;
    remove(file: string, key: string): true;
    getAll(file: string): Record<string, string>;
    save(file: string, vars: Record<string, string>): true;
};

declare const docker: {
    compose: {
        up(options?: ComposeUpOptions): any;
        down(): any;
        pull(): any;
        restart(service?: string): any;
        logs(service?: string, lines?: number): string;
    };
    ps(): any;
    start(service?: string): any;
    stop(service?: string): any;
    exec(service: string, command: string): ShellResult;
    inspect(service: string): any;
    images(): any;
    prune(): any;
    cp: {
        toContainer(service: string, src: string, dest: string): any;
        fromContainer(service: string, src: string, dest: string): any;
    };
};

declare const compose: {
    getEnv(file: string, service: string, key: string): string | null;
    setEnv(file: string, service: string, key: string, value: string): true;
    removeEnv(file: string, service: string, key: string): true;
    getAllEnv(file: string, service: string): Record<string, string>;
    setAllEnv(file: string, service: string, env: Record<string, string>): true;
    getPorts(file: string, service: string): PortMapping[];
    setPort(file: string, service: string, containerPort: string, hostPort: string): true;
    getImage(file: string, service: string): string | null;
    setImage(file: string, service: string, image: string): true;
    getServices(file: string): string[];
};
