import { ArrowRight } from "lucide-react";
import Newsletter from '@/app/components/newsletter';

// przykladowe dane, pozniej dodac pobieranie z bazy danych
const BARBERS = [
    {
        id: "adam",
        name: "Adam",
        bookingName: "adama",
        role: "Barber",
        image: "/images/adam.webp",
        quote: "Klasyka nigdy nie krzyczy, ona po prostu ma klasę.",
        bio: [
            "W branży fryzjerskiej działam od ponad 8 lat. Moja droga zaczęła się od fascynacji tradycyjnym, londyńskim rzemiosłem – gdzie nożyczki, brzytwa i gorący ręcznik stanowiły święty rytuał każdego dżentelmena. Wierzę, że dobra fryzura to nie tylko technika, ale przede wszystkim dopasowanie do charakteru i kształtu twarzy klienta.",
            "Mój styl pracy to spokój i perfekcjonizm. Najlepiej czuję się w klasycznych formach, precyzyjnych cięciach nożyczkami oraz idealnie wyprowadzonych brodach, w których liczy się każdy milimetr.",
            "Poza salonem jestem fanem klasycznej motoryzacji i dobrej kawy przelewowej. Zawsze chętnie podyskutuję na fotelu o starych Porsche czy najlepszych ziarnach z Etiopii."
        ],
        specialties: ["Klasyczne Cięcie Nożyczkami", "Skin Fade", "Golenie Brzytwą"],
    },
    {
        id: "mateusz",
        name: "Mateusz",
        bookingName: "mateusza",
        role: "Head Barber",
        image: "/images/mateusz.webp",
        quote: "Szukam balansu między nowoczesnym szaleństwem a użytkową formą.",
        bio: [
            "Moja przygoda z fryzjerstwem to ciągłe poszukiwanie nowych form. Zawsze ciągnęło mnie w stronę nowoczesnych, odważniejszych stylizacji. Uwielbiam łamać zasady i wprowadzać elementy ze świata mody do codziennych fryzur naszych klientów.",
            "Specjalizuję się w teksturowaniu, budowaniu objętości i nowoczesnych formach takich jak modern mullet czy luźne, surferskie cięcia. Jeśli chcesz zmienić swój wizerunek i szukasz czegoś świeżego, mój fotel to odpowiednie miejsce.",
            "Prywatnie dużo czasu spędzam na desce surfingowej i w podróżach. To właśnie z różnych zakątków świata przywożę nowe inspiracje, które potem przekładam na moją codzienną pracę w Fresh Cut."
        ],
        specialties: ["Modern Mullet", "Teksturowanie Włosów", "Stylizacje Awangardowe"],
    }
];

export default function ArtisansPage() {
    return (
        <div className="min-h-screen">
            {/* naglowek */}
            <header className="pt-40 px-8 lg:px-20 max-w-7xl mx-auto border-b border-outline-variant/10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-16">

                    {/* lewa strona */}
                    <div className="max-w-2xl">
                        <span className="font-label text-primary tracking-[0.3em] text-xs uppercase mb-4 block">
                            Ekipa FreshCut
                        </span>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-none text-on-surface">
                            Poznaj<br /> nasz
                            <span className="text-primary italic font-black"> skład</span>
                        </h1>
                    </div>

                    {/* prawa strona */}
                    <div className="max-w-md lg:pb-3">
                        <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                            Zobacz, kto u nas odpowiada za dobre cięcia. Każdy z nas ma swoje ulubione style i techniki, ale cel mamy ten sam – zależy nam, żebyś po wyjściu z fotela wyglądał i czuł się świetnie.
                        </p>
                    </div>

                </div>
            </header>

            {/* lista barberow */}
            <main className="px-8 lg:px-12 py-24 max-w-380 mx-auto flex flex-col gap-32 md:gap-48">
                {BARBERS.map((barber, index) => {
                    // parzysty do lewej, nieparzysty do prawej
                    const isEven = index % 2 === 0;

                    return (
                        <section
                            key={barber.id}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                        >

                            {/* obrazek */}
                            <div className={`col-span-1 lg:col-span-5 ${isEven ? 'lg:col-start-1' : 'lg:col-start-8 order-1 lg:order-2'}`}>
                                <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface-container-low shadow-2xl">
                                    <img
                                        src={barber.image}
                                        alt={barber.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s] ease-out filter grayscale hover:grayscale-0"
                                    />
                                </div>
                            </div>

                            {/* tekst */}
                            <div className={`col-span-1 lg:col-span-5 flex flex-col justify-center ${isEven ? 'lg:col-start-6' : 'lg:col-start-3 order-2 lg:order-1'}`}>

                                <span className="font-label text-primary tracking-[0.2em] text-xs uppercase font-bold mb-3 block">
                                    {barber.role}
                                </span>

                                <h2 className="font-headline text-5xl md:text-6xl font-black text-on-surface tracking-tighter mb-6">
                                    {barber.name}
                                </h2>

                                <blockquote className="border-l-2 border-primary pl-6 mb-8">
                                    <p className="font-headline text-xl md:text-2xl text-on-surface-variant italic font-light leading-snug">
                                        "{barber.quote}"
                                    </p>
                                </blockquote>

                                <div className="font-body text-on-surface-variant text-base leading-relaxed space-y-4 mb-10">
                                    {barber.bio.map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>

                                <div className="mb-12">
                                    <h3 className="font-label text-xs tracking-widest uppercase text-on-surface-variant/60 mb-4">
                                        Główne specjalizacje
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {barber.specialties.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="border border-outline-variant/30 px-4 py-2 rounded-full text-xs font-label text-on-surface/80"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <button className="flex items-center cursor-pointer gap-3 bg-primary text-on-primary px-8 py-4 rounded-md font-headline font-bold text-sm tracking-widest uppercase hover:brightness-110 hover:shadow-[0_0_30px_-5px_rgba(233,193,118,0.3)] transition-all group">
                                        Zarezerwuj wizytę u {barber.bookingName}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                            </div>
                        </section>
                    );
                })}
            </main>
            <Newsletter />
        </div>
    );
}