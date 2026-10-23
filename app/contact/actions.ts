"use server";

/**
 * Interfejs definiujący strukturę danych formularza kontaktowego.
 */
interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

/**
 * Server Action do obsługi formularza kontaktowego.
 * Waliduje dane wejściowe i symuluje wysyłkę wiadomości do zespołu Fresh Cut.
 * @param data - Dane z formularza kontaktowego (imię, e-mail, opcjonalny telefon, temat, treść).
 * @returns Obiekt informujący o sukcesie lub błędzie z komunikatem zwrotnym.
 */
export async function sendContactMessage(data: ContactFormData) {
    try {
        const { name, email, phone, subject, message } = data;

        if (!name || name.trim().length < 2) {
            return { success: false, message: "Proszę podać poprawne imię i nazwisko." };
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { success: false, message: "Proszę podać poprawny adres e-mail." };
        }

        if (!subject || subject.trim().length < 3) {
            return { success: false, message: "Proszę wybrać lub wpisać temat wiadomości." };
        }

        if (!message || message.trim().length < 10) {
            return { success: false, message: "Wiadomość musi zawierać co najmniej 10 znaków." };
        }

        // do podpiecia pozniej do systemu mailowego lub bazy danych
        console.log("[Nowa wiadomość kontaktowa]", {
            name: name.trim(),
            email: email.trim(),
            phone: phone?.trim() || null,
            subject: subject.trim(),
            message: message.trim(),
            timestamp: new Date().toISOString(),
        });

        return {
            success: true,
            message: "Dziękujemy! Twoja wiadomość została wysłana. Skontaktujemy się z Tobą najszybciej jak to możliwe.",
        };
    } catch (err: unknown) {
        console.error("Błąd sendContactMessage:", err);
        return {
            success: false,
            message: "Wystąpił nieoczekiwany błąd podczas wysyłania wiadomości. Spróbuj ponownie później.",
        };
    }
}
