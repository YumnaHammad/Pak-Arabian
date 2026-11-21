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
  'nav.home': { en: 'Home', ur: 'صفحۂ اول', ru: 'Home' },
  'nav.account': { en: 'Account', ur: 'اکاؤنٹ', ru: 'Account' },
  'nav.shop': { en: 'Shop', ur: 'خریداری', ru: 'Shop' },
  'nav.men': { en: 'Men', ur: 'مردانہ', ru: 'Mardana' },
  'nav.women': { en: 'Women', ur: 'زنانہ', ru: 'Zanana' },
  'nav.about': { en: 'About', ur: 'ہمارے بارے میں', ru: 'Hamare Baare Mein' },
  'nav.contact': { en: 'Contact', ur: 'رابطہ', ru: 'Rabta' },
  'nav.faq': { en: 'FAQ', ur: 'عام سوالات', ru: 'Aam Sawalat' },
  'nav.bag': { en: 'Bag', ur: 'ٹوکری', ru: 'Tokri' },
  'nav.language': { en: 'Language', ur: 'زبان', ru: 'Zuban' },

  /* ── Hero slides ── */
  'hero.kicker': { en: 'Wholesale & Retail · Sadiqabad', ur: 'ہول سیل اور ریٹیل · صادق آباد', ru: 'Wholesale aur Retail · Sadiqabad' },
  's1.title': { en: 'Original perfumes from premium brands', ur: 'مشہور برانڈز کے اصلی پرفیوم', ru: 'Mashhoor brands ke asli perfumes' },
  's1.body': { en: 'Long-lasting fragrances for men and women — 100% original, delivered to your door.', ur: 'مردوں اور خواتین کے لیے دیر تک رہنے والی خوشبوئیں — بالکل اصلی، آپ کی دہلیز تک۔', ru: 'Mardon aur khawateen ke liye der tak rehne wali khushbu — 100% asli, aap ke ghar tak.' },
  's2.title': { en: 'Pure attars, the traditional way', ur: 'خالص عطر، روایتی انداز میں', ru: 'Khalis attar, rivayati andaz mein' },
  's2.body': { en: 'Alcohol-free oils — oud, musk, rose and amber — in every size from tola to wholesale.', ur: 'الکحل سے پاک عطر — عود، مشک، گلاب اور عنبر — ایک تولہ سے لے کر ہول سیل تک۔', ru: 'Alcohol se paak attar — oud, musk, gulab aur amber — tola se wholesale tak.' },
  's3.title': { en: 'For her — soft, floral, unforgettable', ur: 'خواتین کے لیے — نفیس اور دلکش خوشبوئیں', ru: 'Khawateen ke liye — narm, phoolon jaisi khushbu' },
  's3.body': { en: 'Rose, jasmine and musk compositions chosen for everyday elegance and special occasions.', ur: 'گلاب، چنبیلی اور مشک کی خوشبوئیں — روزمرہ استعمال اور خاص مواقع کے لیے۔', ru: 'Gulab, chambeli aur musk ki khushbuein — rozmarra aur khaas mauqon ke liye.' },
  'hero.shop': { en: 'Shop now', ur: 'ابھی خریدیں', ru: 'Abhi khareedein' },
  'hero.whatsapp': { en: 'Order on WhatsApp', ur: 'واٹس ایپ پر آرڈر کریں', ru: 'WhatsApp par order karein' },
  'hero.f1': { en: '100% original', ur: '100٪ اصلی', ru: '100% asli' },
  'hero.f2': { en: 'Cash on delivery', ur: 'کیش آن ڈیلیوری', ru: 'Cash on delivery' },
  'hero.f3': { en: 'Delivery all over Pakistan', ur: 'پورے پاکستان میں ڈیلیوری', ru: 'Poore Pakistan mein delivery' },

  /* ── Range ── */
  'range.kicker': { en: 'Wholesale & Retail', ur: 'ہول سیل اور ریٹیل', ru: 'Wholesale aur Retail' },
  'range.title': { en: 'Nature’s best, under one roof.', ur: 'قدرت کی بہترین نعمتیں، ایک ہی چھت تلے۔', ru: 'Qudrat ki behtareen cheezein, aik hi jagah.' },
  'range.sub': { en: 'Original products from premium brands — for your home or your shop.', ur: 'مشہور برانڈز کی اصلی مصنوعات — گھریلو استعمال اور دکانداروں کے لیے۔', ru: 'Mashhoor brands ki asli products — ghar ke liye ya dukaan ke liye.' },
  'r.perfumes': { en: 'Perfumes', ur: 'پرفیوم', ru: 'Perfume' },
  'r.attars': { en: 'Attars', ur: 'عطر', ru: 'Attar' },
  'r.honey': { en: 'Pure Honey', ur: 'خالص شہد', ru: 'Khalis Shehad' },
  'r.dates': { en: 'Dates & Zam Zam', ur: 'کھجور اور آبِ زمزم', ru: 'Khajoor aur Aab-e-Zamzam' },
  'r.gift': { en: 'Gift Items', ur: 'تحائف', ru: 'Tohfay' },
  'r.caps': { en: 'Caps & Ihram', ur: 'ٹوپی اور احرام', ru: 'Topi aur Ihram' },

  /* ── Trust bar ── */
  't.cod': { en: 'Cash on delivery', ur: 'کیش آن ڈیلیوری', ru: 'Cash on delivery' },
  't.cod.b': { en: 'Pay the courier when your parcel arrives.', ur: 'پارسل ملنے پر کورئیر کو رقم ادا کریں۔', ru: 'Parcel milne par payment karein.' },
  't.ship': { en: 'Delivery in 2–4 days', ur: '2 سے 4 دن میں ڈیلیوری', ru: '2–4 din mein delivery' },
  't.ship.b': { en: 'Anywhere in Pakistan.', ur: 'پاکستان میں کہیں بھی۔', ru: 'Pakistan mein kahin bhi.' },
  't.orig': { en: '100% original', ur: '100٪ اصلی', ru: '100% asli' },
  't.orig.b': { en: 'Genuine products from trusted brands.', ur: 'معتبر برانڈز کی اصلی مصنوعات۔', ru: 'Bharosemand brands ki asli products.' },
  't.ret': { en: 'Easy returns', ur: 'آسان واپسی', ru: 'Aasaan wapsi' },
  't.ret.b': { en: 'Not happy? Return within 14 days.', ur: 'پسند نہ آئے تو 14 دن کے اندر واپس کریں۔', ru: 'Pasand na aaye to 14 din mein wapas karein.' },

  /* ── Section headings ── */
  'cat.kicker': { en: 'Shop by category', ur: 'زمرے کے مطابق خریدیں', ru: 'Category ke mutabiq khareedein' },
  'cat.title': { en: 'What are you looking for?', ur: 'آپ کیا ڈھونڈ رہے ہیں؟', ru: 'Aap kya dhoond rahe hain?' },
  /* ── Category cards ── */
  'door.men': { en: 'Men', ur: 'مردانہ', ru: 'Mardana' },
  'door.men.l': { en: 'Bold woods, oud and leather.', ur: 'عود، لکڑی اور چمڑے کی بھرپور خوشبوئیں۔', ru: 'Oud, lakri aur leather ki bharpoor khushbu.' },
  'door.women': { en: 'Women', ur: 'زنانہ', ru: 'Zanana' },
  'door.women.l': { en: 'Rose, florals and soft musk.', ur: 'گلاب، پھولوں اور نرم مشک کی خوشبوئیں۔', ru: 'Gulab, phool aur narm musk.' },
  'door.unisex': { en: 'Unisex', ur: 'سب کے لیے', ru: 'Sab ke liye' },
  'door.unisex.l': { en: 'Clean musks anyone can wear.', ur: 'ہلکی مشک جو ہر کوئی لگا سکے۔', ru: 'Halki musk jo har koi laga sake.' },
  'door.signature': { en: 'Signature', ur: 'خاص انتخاب', ru: 'Khaas Intikhab' },
  'door.signature.l': { en: 'Our most-loved picks.', ur: 'ہمارے سب سے پسندیدہ انتخاب۔', ru: 'Hamare sab se pasandeeda intikhab.' },
  'cat.items': { en: 'items', ur: 'اشیاء', ru: 'items' },

  /* ── Best sellers ── */
  'best.kicker': { en: 'Shop now', ur: 'ابھی خریدیں', ru: 'Abhi khareedein' },
  'best.title': { en: 'Best sellers', ur: 'سب سے زیادہ فروخت ہونے والی', ru: 'Sab se zyada bikne wali' },
  'best.sub': { en: 'Delivery charges are shown at checkout. Pay when it arrives.', ur: 'ڈیلیوری چارجز چیک آؤٹ پر دکھائے جاتے ہیں۔ ادائیگی پارسل ملنے پر۔', ru: 'Delivery charges checkout par nazar aayenge. Payment parcel milne par.' },
  'best.all': { en: 'See the full collection', ur: 'پوری کلیکشن دیکھیں', ru: 'Poori collection dekhein' },

  /* ── How it works ── */
  'how.kicker': { en: 'Ordering is simple', ur: 'آرڈر کرنا آسان ہے', ru: 'Order karna aasaan hai' },
  'how.title': { en: 'How it works', ur: 'طریقۂ کار', ru: 'Tareeqa-e-kaar' },
  'how.sub': { en: 'No card, no account, no payment until the parcel is in your hand.', ur: 'نہ کارڈ، نہ اکاؤنٹ — ادائیگی صرف پارسل ملنے پر۔', ru: 'Na card, na account — payment sirf parcel milne par.' },
  'how.1': { en: 'Choose your product', ur: 'اپنی پسند کی چیز منتخب کریں', ru: 'Apni pasand ki cheez chunein' },
  'how.1.b': { en: 'Browse perfumes, attars, honey and more. Every item shows its price.', ur: 'پرفیوم، عطر، شہد اور بہت کچھ دیکھیں۔ ہر چیز کی قیمت درج ہے۔', ru: 'Perfume, attar, shehad aur bohat kuch dekhein. Har cheez ki qeemat likhi hai.' },
  'how.2': { en: 'Place your order', ur: 'آرڈر دیں', ru: 'Order dein' },
  'how.2.b': { en: 'Enter your name, phone and address — or simply order on WhatsApp.', ur: 'اپنا نام، فون نمبر اور پتہ درج کریں — یا واٹس ایپ پر آرڈر کریں۔', ru: 'Apna naam, phone number aur pata likhein — ya WhatsApp par order karein.' },
  'how.3': { en: 'Pay on delivery', ur: 'ڈیلیوری پر ادائیگی', ru: 'Delivery par payment' },
  'how.3.b': { en: 'Hand the cash to the courier when the parcel reaches your door.', ur: 'پارسل گھر پہنچنے پر کورئیر کو نقد رقم ادا کریں۔', ru: 'Parcel ghar pohanchne par courier ko cash dein.' },
  'how.start': { en: 'Start shopping', ur: 'خریداری شروع کریں', ru: 'Shopping shuru karein' },
  'how.q': { en: 'Questions? WhatsApp us on', ur: 'کوئی سوال؟ واٹس ایپ کریں:', ru: 'Koi sawal? WhatsApp karein:' },

  /* ── Quick answers ── */
  'qa.kicker': { en: 'Before you order', ur: 'آرڈر سے پہلے', ru: 'Order se pehle' },
  'qa.title': { en: 'Common questions', ur: 'عام سوالات', ru: 'Aam sawalat' },
  'qa.sub': { en: 'Still unsure? Message the shop directly on WhatsApp.', ur: 'مزید معلومات چاہییں؟ واٹس ایپ پر براہِ راست رابطہ کریں۔', ru: 'Mazeed maloomat chahiye? WhatsApp par seedha rabta karein.' },
  'qa.all': { en: 'All questions', ur: 'تمام سوالات', ru: 'Tamam sawalat' },
  'qa.1': { en: 'How do I pay?', ur: 'ادائیگی کیسے کروں؟', ru: 'Payment kaise karun?' },
  'qa.1.a': { en: 'Cash to the courier when your parcel arrives. Nothing is charged when you place the order.', ur: 'پارسل ملنے پر کورئیر کو نقد ادائیگی کریں۔ آرڈر دیتے وقت کوئی رقم نہیں لی جاتی۔', ru: 'Parcel milne par courier ko cash dein. Order dete waqt koi raqam nahi li jati.' },
  'qa.2': { en: 'How long does delivery take?', ur: 'ڈیلیوری میں کتنا وقت لگتا ہے؟', ru: 'Delivery mein kitna waqt lagta hai?' },
  'qa.2.a': { en: 'Usually 2–4 working days anywhere in Pakistan.', ur: 'عام طور پر پاکستان بھر میں 2 سے 4 کاروباری دن۔', ru: 'Aam tor par poore Pakistan mein 2–4 working din.' },
  'qa.3': { en: 'Are the products original?', ur: 'کیا مصنوعات اصلی ہیں؟', ru: 'Kya products asli hain?' },
  'qa.3.a': { en: 'Yes. We sell original products from premium brands, wholesale and retail.', ur: 'جی ہاں۔ ہم مشہور برانڈز کی اصلی مصنوعات ہول سیل اور ریٹیل دونوں میں فروخت کرتے ہیں۔', ru: 'Ji haan. Hum mashhoor brands ki asli products wholesale aur retail dono mein bechte hain.' },
  'qa.4': { en: 'Do you sell wholesale?', ur: 'کیا آپ ہول سیل میں بھی دیتے ہیں؟', ru: 'Kya aap wholesale bhi dete hain?' },
  'qa.4.a': { en: 'Yes. Call or WhatsApp us for wholesale rates on perfumes, attars, honey and dates.', ur: 'جی ہاں۔ پرفیوم، عطر، شہد اور کھجور کے ہول سیل ریٹ کے لیے کال یا واٹس ایپ کریں۔', ru: 'Ji haan. Perfume, attar, shehad aur khajoor ke wholesale rate ke liye call ya WhatsApp karein.' },

  /* ── Footer ── */
  'f.tag': { en: 'Premium Brands · Original Products · Wholesale & Retail', ur: 'مشہور برانڈز · اصلی مصنوعات · ہول سیل اور ریٹیل', ru: 'Mashhoor Brands · Asli Products · Wholesale aur Retail' },
  'f.shop': { en: 'Shop', ur: 'خریداری', ru: 'Shop' },
  'f.help': { en: 'Help', ur: 'مدد', ru: 'Madad' },
  'f.visit': { en: 'Visit our shop', ur: 'ہماری دکان', ru: 'Hamari dukaan' },
  'f.call': { en: 'Call / WhatsApp', ur: 'کال / واٹس ایپ', ru: 'Call / WhatsApp' },
  'f.dir': { en: 'Get directions', ur: 'راستہ دیکھیں', ru: 'Rasta dekhein' },
  'f.all': { en: 'All products', ur: 'تمام مصنوعات', ru: 'Tamam products' },
  'f.account': { en: 'My account', ur: 'میرا اکاؤنٹ', ru: 'Mera account' },
  'f.returns': { en: 'Delivery & returns', ur: 'ڈیلیوری اور واپسی', ru: 'Delivery aur wapsi' },
  'f.terms': { en: 'Terms', ur: 'شرائط', ru: 'Sharait' },
  'f.privacy': { en: 'Privacy', ur: 'رازداری', ru: 'Razdari' },
  'f.rights': { en: 'All rights reserved.', ur: 'جملہ حقوق محفوظ ہیں۔', ru: 'Tamam huqooq mehfooz hain.' },
  'f.addr1': { en: 'Qazafi Bazar, Kothi Area,', ur: 'قذافی بازار، کوٹھی ایریا،', ru: 'Qazafi Bazar, Kothi Area,' },
  'f.addr2': { en: 'Opp. Masjid Khizra, Sadiqabad', ur: 'بالمقابل مسجد خضریٰ، صادق آباد', ru: 'Masjid Khizra ke saamne, Sadiqabad' },
  'cat.all': { en: 'View all →', ur: 'سب دیکھیں', ru: 'Sab dekhein →' },
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
