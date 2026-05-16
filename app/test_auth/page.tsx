"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    return (

        //glowny kontener
        <div className="bg-background text-on-background font-body min-h-screen relative overflow-y-auto">

            {/* fota */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                    alt="Barber"
                    className="w-full h-full object-cover grayscale"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbwdiBtwz1pBRYojhxzs5Bj2wp564xZBo1BIO1vAPXqGG2O5wsCNpkIUQD0W9fFYM3vBq8LI9EunV6qJh6hJIvZg_FYMvgUVcb6Ix-q0jg2Y3bvmHGzSt_oq-zbYYd4PzbG7k3zu_-iQtsXTFe-DzTKCaDj7uGYrGBhiHfRuJ-Q5_0yCwIaVUfba7ZuRqC_5obJgbxAbW40sKFZqc66kboDEAVizXYtC72iCN51ecsBdUm6M0iDAc7Mcfr5ZxoKf-0KBAvii0o15zj"
                />
                {/* gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
                <div className="glass-panel w-full max-w-xl p-8 md:p-12 rounded-xl border border-outline-variant/10 shadow-2xl">

                    <div className="mb-10 text-center md:text-left">
                        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-2 block">Rejestracja</span>
                        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-background mb-4">
                            Dołącz do <span className="text-primary italic">Twoja nazwa</span>
                        </h1>
                        <p className="text-on-surface-variant max-w-sm leading-relaxed mx-auto md:mx-0">Doświadcz precyzyjnej pielęgnacji dostosowanej do Twojego wyjątkowego charakteru. Twoja podróż zaczyna się tutaj.</p>
                    </div>
                    {/* formularz */}
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* imie i nazwisko */}
                            <div className=" flex flex-col gap-1.5">
                                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">Imię i Nazwisko</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Dawid Staniaszek"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/20 transition-all font-medium tracking-wider text-white"
                                />
                            </div>
                            {/* {numer teleofnu} */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                    Numer Telefonu
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="+48 000-000-000"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white"
                                />
                            </div>
                        </div>
                        {/* email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                Adres E-mail
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="vance@atelier.com"
                                className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white"
                            />
                        </div>

                        {/* hasło*/}


                        <div className="flex flex-col gap-1.5">
                            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                Hasło
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-white cursor-pointer select-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Ppotwierdzenie hasla*/}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                Potwierdź Hasło
                            </label>
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-white cursor-pointer select-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>


                        {/* button submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                            >
                                Utwórz konto
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                    </form>
                </div>


            </main>

        </div>
    )
}