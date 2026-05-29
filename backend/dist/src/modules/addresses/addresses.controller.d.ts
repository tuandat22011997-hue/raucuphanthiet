import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
export declare class AddressesController {
    private readonly addressesService;
    constructor(addressesService: AddressesService);
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
    update(userId: string, id: string, dto: UpdateAddressDto): Promise<{
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
    remove(userId: string, id: string): Promise<{
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
