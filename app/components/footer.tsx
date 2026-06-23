import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full py-12 px-8 mt-auto bg-background">
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-primary/10 pt-8">
                <div className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 mb-8 md:mb-0">
                    © 2026 Fresh Cut. WSZELKIE PRAWA ZASTRZEŻONE.
                </div>
                <div className="flex flex-wrap justify-center gap-8 mb-8 md:mb-0">
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