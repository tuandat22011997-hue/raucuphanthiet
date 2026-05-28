"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({ where: { deletedAt: { not: null } } });
    for (const user of users) {
        if (!user.email.includes('_deleted_')) {
            await prisma.user.update({
                where: { id: user.id },
                data: { email: `${user.email}_deleted_${Date.now()}` }
            });
            console.log(`Updated ${user.email}`);
        }
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=fix-emails.js.map