'use client';
import { useEffect } from 'react';
import { create } from 'zustand';

/**
 * Three storefront languages: English, Urdu (Nastaliq, right-to-left) and
 * Roman Urdu. The choice is remembered per browser.
 */
export const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ur', label: 'اردو', short: 'اردو' },
  { code: 'ru', label: 'Roman Urdu', short: 'Roman' },
];

const KEY = 'pakarabian_lang';

export const useLang = create((set) => ({
  lang: 'en',
  setLang: (lang) => {
    try { localStorage.setItem(KEY, lang); } catch {}
    set({ lang });
  },
}));

const DICT = {
  /* ── Navigation ── */
  'nav.home': { en: 'Home', ur: 'ہوم', ru: 'Home' },
  'nav.account': { en: 'Account', ur: 'اکاؤنٹ', ru: 'Account' },
  'nav.shop': { en: 'Shop', ur: 'دکان', ru: 'Shop' },
  'nav.men': { en: 'Men', ur: 'مردانہ', ru: 'Mardana' },
  'nav.women': { en: 'Women', ur: 'زنانہ', ru: 'Zanana' },
  'nav.about': { en: 'About', ur: 'ہمارے بارے میں', ru: 'Hamare Baare Mein' },
  'nav.contact': { en: 'Contact', ur: 'رابطہ', ru: 'Rabta' },
  'nav.faq': { en: 'FAQ', ur: 'سوالات', ru: 'Sawalat' },
  'nav.bag': { en: 'Bag', ur: 'تھیلا', ru: 'Bag' },
  'nav.language': { en: 'Language', ur: 'زبان', ru: 'Zuban' },

  /* ── Hero slides ── */
  'hero.kicker': { en: 'Wholesale & Retail · Sadiqabad', ur: 'ہول سیل اور ریٹیل · صادق آباد', ru: 'Wholesale aur Retail · Sadiqabad' },
  's1.title': { en: 'Original perfumes from premium brands', ur: 'مشہور برانڈز کے اصلی پرفیوم', ru: 'Mashhoor brands ke asli perfumes' },
  's1.body': { en: 'Long-lasting fragrances for men and women — 100% original, delivered to your door.', ur: 'مردوں اور خواتین کے لیے دیرپا خوشبوئیں — سو فیصد اصلی، آپ کے گھر تک۔', ru: 'Mardon aur khawateen ke liye der tak rehne wali khushbu — 100% asli, aap ke ghar tak.' },
  's2.title': { en: 'Pure attars, the traditional way', ur: 'خالص عطر، روایتی انداز میں', ru: 'Khalis attar, rivayati andaz mein' },
  's2.body': { en: 'Alcohol-free oils — oud, musk, rose and amber — in every size from tola to wholesale.', ur: 'الکوحل سے پاک عطر — عود، مشک، گلاب اور عنبر — تولہ سے ہول سیل تک۔', ru: 'Alcohol se paak attar — oud, musk, gulab aur amber — tola se wholesale tak.' },
  's3.title': { en: 'For her — soft, floral, unforgettable', ur: 'خواتین کے لیے — نرم، پھولوں جیسی خوشبو', ru: 'Khawateen ke liye — narm, phoolon jaisi khushbu' },
  's3.body': { en: 'Rose, jasmine and musk compositions chosen for everyday elegance and special occasions.', ur: 'گلاب، چنبیلی اور مشک کی خوشبوئیں — روزمرہ اور خاص موقعوں کے لیے۔', ru: 'Gulab, chambeli aur musk ki khushbuein — rozmarra aur khaas mauqon ke liye.' },
  'hero.shop': { en: 'Shop now', ur: 'ابھی خریدیں', ru: 'Abhi khareedein' },
  'hero.whatsapp': { en: 'Order on WhatsApp', ur: 'واٹس ایپ پر آرڈر کریں', ru: 'WhatsApp par order karein' },
  'hero.f1': { en: '100% original', ur: 'سو فیصد اصلی', ru: '100% asli' },
  'hero.f2': { en: 'Cash on delivery', ur: 'کیش آن ڈیلیوری', ru: 'Cash on delivery' },
  'hero.f3': { en: 'Delivery all over Pakistan', ur: 'پورے پاکستان میں ڈیلیوری', ru: 'Poore Pakistan mein delivery' },

  /* ── Range ── */
  'range.kicker': { en: 'Wholesale & Retail', ur: 'ہول سیل اور ریٹیل', ru: 'Wholesale aur Retail' },
  'range.title': { en: 'Nature’s best, under one roof.', ur: 'قدرت کی بہترین چیزیں، ایک ہی جگہ۔', ru: 'Qudrat ki behtareen cheezein, aik hi jagah.' },
  'range.sub': { en: 'Original products from premium brands — for your home or your shop.', ur: 'مشہور برانڈز کی اصلی مصنوعات — گھر کے لیے یا دکان کے لیے۔', ru: 'Mashhoor brands ki asli products — ghar ke liye ya dukaan ke liye.' },
  'r.perfumes': { en: 'Perfumes', ur: 'پرفیوم', ru: 'Perfume' },
  'r.attars': { en: 'Attars', ur: 'عطر', ru: 'Attar' },
  'r.honey': { en: 'Pure Honey', ur: 'خالص شہد', ru: 'Khalis Shehad' },
  'r.dates': { en: 'Dates & Zam Zam', ur: 'کھجور اور آبِ زمزم', ru: 'Khajoor aur Aab-e-Zamzam' },
  'r.gift': { en: 'Gift Items', ur: 'تحائف', ru: 'Tohfay' },
  'r.caps': { en: 'Caps & Ihram', ur: 'ٹوپی اور احرام', ru: 'Topi aur Ihram' },

  /* ── Trust bar ── */
  't.cod': { en: 'Cash on delivery', ur: 'کیش آن ڈیلیوری', ru: 'Cash on delivery' },
  't.cod.b': { en: 'Pay the courier when your parcel arrives.', ur: 'پارسل ملنے پر ادائیگی کریں۔', ru: 'Parcel milne par payment karein.' },
  't.ship': { en: 'Delivery in 2–4 days', ur: 'دو سے چار دن میں ڈیلیوری', ru: '2–4 din mein delivery' },
  't.ship.b': { en: 'Anywhere in Pakistan.', ur: 'پاکستان میں کہیں بھی۔', ru: 'Pakistan mein kahin bhi.' },
  't.orig': { en: '100% original', ur: 'سو فیصد اصلی', ru: '100% asli' },
  't.orig.b': { en: 'Genuine products from trusted brands.', ur: 'بھروسہ مند برانڈز کی اصلی مصنوعات۔', ru: 'Bharosemand brands ki asli products.' },
  't.ret': { en: 'Easy returns', ur: 'آسان واپسی', ru: 'Aasaan wapsi' },
  't.ret.b': { en: 'Not happy? Return within 14 days.', ur: 'پسند نہ آئے تو چودہ دن میں واپس کریں۔', ru: 'Pasand na aaye to 14 din mein wapas karein.' },

  /* ── Section headings ── */
  'cat.kicker': { en: 'Shop by category', ur: 'کیٹیگری کے مطابق خریدیں', ru: 'Category ke mutabiq khareedein' },
  'cat.title': { en: 'What are you looking for?', ur: 'آپ کیا ڈھونڈ رہے ہیں؟', ru: 'Aap kya dhoond rahe hain?' },
  'cat.all': { en: 'View all →', ur: 'سب دیکھیں ←', ru: 'Sab dekhein →' },
};

export function translate(lang, key) {
  const e = DICT[key];
  return e ? e[lang] || e.en : key;
}

export function useT() {
  const lang = useLang((s) => s.lang);
  return (key) => translate(lang, key);
}

/** Restores the saved language and keeps <html lang/dir> in sync. */
export function LangSync() {
  const lang = useLang((s) => s.lang);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && saved !== 'en' && LANGS.some((l) => l.code === saved)) useLang.setState({ lang: saved });
    } catch {}
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang === 'ur' ? 'ur' : 'en';
    el.dir = lang === 'ur' ? 'rtl' : 'ltr';
    el.dataset.lang = lang;
  }, [lang]);
  return null;
}
