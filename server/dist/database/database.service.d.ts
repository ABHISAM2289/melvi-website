import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    pool: Pool;
    isConnected: boolean;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    query(text: string, params?: any[]): Promise<import("pg").QueryResult<any> | {
        rows: any[];
    }>;
    private initSchema;
    private seedInitialData;
}
