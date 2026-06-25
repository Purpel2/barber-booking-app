import Newsletter from '../components/newsletter';

export default function MembershipPage() {
    return (
        <div className="bg-background text-on-surface font-body min-h-screen w-full overflow-x-hidden selection:bg-primary selection:text-on-primary">

            {/* naglowek */}
            <section className="pt-28 pb-22 px-8 lg:px-20 max-w-350 mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">

                    {/* lewa strona */}
                    <div>
                        <span className="font-label text-xs sm:text-sm uppercase tracking-widest text-primary mb-2 block font-bold">
                            Subskrypcja
                        </span>
                        <h1 className="font-headline text-4xl sm:text-5xl md:text-[80px] font-black uppercase tracking-tighter leading-[0.85] text-on-surface">
                            SALON<br /> <span className="text-primary">FRESH CUT</span>
                        </h1>
                    </div>

                    {/* prawa strona*/}
                    <div className="max-w-md lg:pb-2">
                        <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                            Kto wpada regularnie, ten zgarnia więcej. Wybierasz plan, płacisz raz w miesiącu i zapominasz o portfelu. Zawsze świeży look, bez stresu o terminy.
                        </p>
                    </div>

                </div>
            </section>

            {/* sekcja z planami subskypcji */}
            <section className="px-8 lg:px-20 max-w-350 mx-auto mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">

                    {/* plan 1 - fresh */}
                    <div className="bg-surface-container-low p-8 md:p-10 rounded-2xl relative group flex flex-col justify-between h-full hover:bg-surface-container-high transition-all duration-300 border border-outline-variant/10">
                        <div>
                            <h3 className="font-headline text-3xl font-black uppercase tracking-tight mb-2">Fresh</h3>
                            <p className="text-primary text-4xl font-black mb-6">
                                149 PLN <span className="text-sm text-on-surface-variant font-normal tracking-normal uppercase">/ msc</span>
                            </p>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">1x Strzyżenie włosów + stylizacja</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">1x Szybkie odświeżenie (podgolenie karku/boków)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface-variant">Rabat -5% na wszystkie kosmetyki</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface-variant">Kawa, zimne piwo lub whisky w cenie</span>
                                </li>
                            </ul>
                        </div>
                        <button className="cursor-pointer w-full py-4 bg-transparent border-2 border-outline-variant text-on-surface font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95">
                            Wybierz Fresh
                        </button>
                    </div>

                    {/* plan 2- sharp */}
                    <div className="bg-surface-container-high p-8 md:p-10 rounded-2xl relative group flex flex-col justify-between h-full border-2 border-primary shadow-[0_20px_50px_rgba(233,193,118,0.1)] lg:scale-105 z-10">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1.5 font-bold text-xs uppercase tracking-widest whitespace-nowrap shadow-lg">
                            Najczęściej Wybierany
                        </div>
                        <div>
                            <h3 className="font-headline text-3xl font-black uppercase tracking-tight mb-2">Sharp</h3>
                            <p className="text-primary text-5xl font-black mb-6">
                                219 PLN <span className="text-sm text-on-surface-variant font-normal tracking-normal uppercase">/ msc</span>
                            </p>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">1x Pełny Serwis (Włosy + Broda)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">1x Szybkie odświeżenie (podgolenie karku/boków)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">Rabat -10% na wszystkie kosmetyki</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">Kawa, zimne piwo lub whisky w cenie</span>
                                </li>
                            </ul>
                        </div>
                        <button className="cursor-pointer w-full py-4 bg-primary text-on-primary font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-[0_10px_20px_rgba(233,193,118,0.2)]">
                            Wybierz Sharp
                        </button>
                    </div>

                    {/* plan 3 - prime*/}
                    <div className="bg-surface-container-low p-8 md:p-10 rounded-2xl relative group flex flex-col justify-between h-full hover:bg-surface-container-high transition-all duration-300 border border-outline-variant/10">
                        <div>
                            <h3 className="font-headline text-3xl font-black uppercase tracking-tight mb-2">Prime</h3>
                            <p className="text-primary text-4xl font-black mb-6">
                                399 PLN <span className="text-sm text-on-surface-variant font-normal tracking-normal uppercase">/ msc</span>
                            </p>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">2x Pełny Serwis (Włosy + Broda)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface">Mycie z masażem głowy i gorący ręcznik do każdego cięcia</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface-variant">Wybrany kosmetyk gratis co 2 miesiące</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface-variant">Rabat -15% na wszystkie kosmetyki</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span className="text-base text-on-surface-variant">Kawa, zimne piwo lub whisky w cenie</span>
                                </li>
                            </ul>
                        </div>
                        <button className="cursor-pointer w-full py-4 bg-transparent border-2 border-outline-variant text-on-surface font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95">
                            Wybierz Prime
                        </button>
                    </div>

                </div>
            </section>

            {/* sekcja po co ci czlonkostwo */}
            <section className="px-8 lg:px-20 max-w-350 mx-auto py-24 border-t border-outline-variant/10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    <div className="order-2 lg:order-1">
                        <h2 className="font-headline text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
                            PO CO CI<br />
                            <span className="text-primary">CZŁONKOSTWO?</span>
                        </h2>
                        <p className="font-body text-on-surface-variant text-lg mb-12 max-w-lg leading-relaxed">
                            Bycie w klubie to nie tylko regularne cięcie. To oszczędność kasy, brak stresu o wolne terminy przed weekendem i stały dostęp do najlepszych kosmetyków na Twojej półce.
                        </p>

                        <div className="flex flex-col gap-10">
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 shrink-0 rounded-full border border-primary/30 flex items-center justify-center text-primary font-black text-2xl">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-bold text-2xl uppercase tracking-tight mb-2">Świeżość Non-Stop</h4>
                                    <p className="text-base text-on-surface-variant leading-relaxed">Zapomnij o zarastaniu pod koniec miesiąca. Dzięki szybkim poprawkom (line-up karku i boków) w połowie cyklu, Twój kontur jest zawsze ostry. Wpadasz na kwadrans i wracasz do gry.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 shrink-0 rounded-full border border-primary/30 flex items-center justify-center text-primary font-black text-2xl">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-bold text-2xl uppercase tracking-tight mb-2">Czysta Kalkulacja</h4>
                                    <p className="text-base text-on-surface-variant leading-relaxed">Subskrypcja to po prostu oszczędność. Płacisz zauważalnie mniej niż za pojedyncze wizyty, zgarniasz zniżki na kosmetyki, a po cięciu po prostu wstajesz i wychodzisz. Zero wyciągania portfela przy kasie.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 grid grid-cols-2 gap-6">
                        <div className="aspect-4/5 bg-surface-container-highest rounded-xl overflow-hidden mt-12 shadow-2xl">
                            <img className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-500" src="images/membership/membership1.webp" alt="Kosmetyki" />
                        </div>
                        <div className="aspect-4/5 bg-surface-container-highest rounded-xl overflow-hidden shadow-2xl">
                            <img className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-500" src="images/membership/membership2.webp" alt="Detal strzyżenia" />
                        </div>
                    </div>

                </div>
            </section>
            <Newsletter />
        </div>
    );
}