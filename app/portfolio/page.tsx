import { prisma } from "@/lib/prisma";
import PortfolioClient from "./PortfolioClient";

// Cache na 24h - oszczędza połączenia z bazą (Connection Pool)
export const revalidate = 86400;


/**
 * Strona PortfolioPage wyświetla portfolio barbera, pokazując jego prace w formie galerii zdjęć.
 * Pobiera dane barberów i portfolio z bazy danych przy użyciu Prisma i renderuje je w responsywnym układzie.
 * Każdy element portfolio zawiera zdjęcie, opis oraz informacje o barberskim autorze.
 * Strona umożliwia filtrowanie portfolio według barbera, aby użytkownicy mogli zobaczyć prace konkretnego barbera.
 * Jeśli nie ma żadnych elementów portfolio, wyświetlany jest komunikat informujący o braku dostępnych prac.
 */
export default async function PortfolioPage() {
    const [barbers, portfolioItems] = await Promise.all([
        prisma.barber.findMany({
            where: { isActive: true },
            select: { id: true, name: true, imageUrl: true },
            orderBy: { name: "asc" }
        }),
        prisma.portfolioItem.findMany({
            orderBy: { createdAt: "desc" }
        })
    ]);

    return (
        <PortfolioClient initialBarbers={barbers} initialItems={portfolioItems} />
    );
}