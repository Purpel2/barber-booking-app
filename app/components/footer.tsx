import Link from "next/link";

/**
 * Komponent stopki strony, zawierający informacje o prawach autorskich oraz linki do polityki prywatności, warunków korzystania, kariery i lokalizacji.
 * Jest responsywny i dostosowuje układ w zależności od szerokości ekranu.
 * Na mniejszych ekranach elementy są wyświetlane w kolumnie, a na większych w wierszu.
 * Stylizacja oparta jest na klasach Tailwind CSS.
 */
export default function Footer() {
    return (
        <footer className="w-full mt-auto bg-background border-t border-primary/10">
            <div className="w-full px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40">
                    © 2026 Fresh Cut. WSZELKIE PRAWA ZASTRZEŻONE.
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-8">
                    <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">
                        PRYWATNOŚĆ
                    </Link>
                    <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">
                        WARUNKI
                    </Link>
                    <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">
                        KARIERA
                    </Link>
                    <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">
                        LOKALIZACJA
                    </Link>
                </div>
            </div>
        </footer>
    );
}