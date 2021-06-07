declare interface ICredentials {
    address: string,
    port: number,
    username: string,
    password: string,
    protocol: string,
    authorization: string;
}

declare class LeagueConnector {

    credentials: ICredentials[]
    
    constructor();

    static getLCUCredentialsFromProcess(): Promise<ICredentials | void>;

    start(): void;

    stop(): void;
    
    watchLeagueClient(): void;

    on(event: 'connect', listener: (data: ICredentials) => void): this;

    on(event: 'disconnect', listener: (data: ICredentials) => void): this;
}

export = LeagueConnector;