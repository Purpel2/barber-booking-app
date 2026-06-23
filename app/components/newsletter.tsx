"use client";
import { useState, FormEvent } from 'react';

export default function Newsletter() {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) return;

        console.log('Zapisano e-mail:', email);
        alert(`Dzięki! E-mail ${email} został zapisany.`);
        setEmail('');
    };

    return (
        <section className="py-12 px-8 text-center bg-surface-container-low border-t border-outline-variant/10">
            <h2 className="font-headline text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                ZAPISZ SIĘ DO <span className="text-primary">NEWSLETTERA</span>
            </h2>
            <p className="text-on-surface-variant text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                Zostaw maila i wpadnij na naszą zamkniętą listę. Podrzucamy tylko tajne zniżki na kosmetyki, porady od naszych barberów i cynk, gdy otwieramy grafik na gorące okresy.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-lg mx-auto relative group">
                <input
                    className="w-full bg-background border-2 border-outline-variant/20 py-5 pl-6 pr-40 rounded-none focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                    placeholder="Twój adres e-mail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    type="submit"
                    className="cursor-pointer absolute right-2 top-2 bottom-2 bg-primary text-on-primary px-8 font-bold uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95"
                >
                    Zapisz
                </button>
            </form>
        </section>
    );
}