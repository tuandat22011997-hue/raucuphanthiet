import { PrismaService } from '../../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(): Promise<Record<string, string>>;
    updateMany(data: Record<string, string>): Promise<Record<string, string>>;
}
