import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
export declare class AddressesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        userId: string;
        label: string | null;
        fullName: string;
        isDefault: boolean;
    }[]>;
    create(userId: string, dto: CreateAddressDto): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        userId: string;
        label: string | null;
        fullName: string;
        isDefault: boolean;
    }>;
    update(userId: string, addressId: string, dto: UpdateAddressDto): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        userId: string;
        label: string | null;
        fullName: string;
        isDefault: boolean;
    }>;
    remove(userId: string, addressId: string): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        userId: string;
        label: string | null;
        fullName: string;
        isDefault: boolean;
    }>;
}
