import { TRANSLATIONS } from '../constants/translateLanguage';
export const trls = (translate_key) => {
    var lang = window.localStorage.getItem('nevema_lang');
    return(
        TRANSLATIONS[lang][translate_key]
    )
};

export const trlsPDF = (translate_key) => {
    var lang = window.localStorage.getItem('nevema_lang_PDF');
    return(
        TRANSLATIONS[lang][translate_key]
    )
};