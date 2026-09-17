export interface Country {
  code: string;       // ISO 2-letter code
  nameAr: string;     // Arabic country name
  nameEn: string;     // English country name
  dialCode: string;   // e.g. +966
  flag: string;       // emoji flag
  isArab?: boolean;   // Arab League nation
}

export const COUNTRIES: Country[] = [
  // Arab League Nations (الأولى والمفضلة)
  { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', isArab: true },
  { code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', isArab: true },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dialCode: '+965', flag: '🇰🇼', isArab: true },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dialCode: '+974', flag: '🇶🇦', isArab: true },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dialCode: '+973', flag: '🇧🇭', isArab: true },
  { code: 'OM', nameAr: 'سلطنة عمان', nameEn: 'Oman', dialCode: '+968', flag: '🇴🇲', isArab: true },
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', dialCode: '+20', flag: '🇪🇬', isArab: true },
  { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', dialCode: '+964', flag: '🇮🇶', isArab: true },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dialCode: '+962', flag: '🇯🇴', isArab: true },
  { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', dialCode: '+963', flag: '🇸🇾', isArab: true },
  { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', dialCode: '+961', flag: '🇱🇧', isArab: true },
  { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', dialCode: '+970', flag: '🇵🇸', isArab: true },
  { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', dialCode: '+967', flag: '🇾🇪', isArab: true },
  { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', dialCode: '+212', flag: '🇲🇦', isArab: true },
  { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', dialCode: '+213', flag: '🇩🇿', isArab: true },
  { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', dialCode: '+216', flag: '🇹🇳', isArab: true },
  { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', dialCode: '+218', flag: '🇱🇾', isArab: true },
  { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', dialCode: '+249', flag: '🇸🇩', isArab: true },
  { code: 'MR', nameAr: 'موريتانيا', nameEn: 'Mauritania', dialCode: '+222', flag: '🇲🇷', isArab: true },
  { code: 'SO', nameAr: 'الصومال', nameEn: 'Somalia', dialCode: '+252', flag: '🇸🇴', isArab: true },
  { code: 'DJ', nameAr: 'جيبوتي', nameEn: 'Djibouti', dialCode: '+253', flag: '🇩🇯', isArab: true },
  { code: 'KM', nameAr: 'جزر القمر', nameEn: 'Comoros', dialCode: '+269', flag: '🇰🇲', isArab: true },

  // Middle East & West/Central Asia
  { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'IR', nameAr: 'إيران', nameEn: 'Iran', dialCode: '+98', flag: '🇮🇷' },
  { code: 'AZ', nameAr: 'أذربيجان', nameEn: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿' },
  { code: 'GE', nameAr: 'جورجيا', nameEn: 'Georgia', dialCode: '+995', flag: '🇬🇪' },
  { code: 'AM', nameAr: 'أرمينيا', nameEn: 'Armenia', dialCode: '+374', flag: '🇦🇲' },
  { code: 'UZ', nameAr: 'أوزبكستان', nameEn: 'Uzbekistan', dialCode: '+998', flag: '🇺🇿' },
  { code: 'KZ', nameAr: 'كازاخستان', nameEn: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿' },
  { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'AF', nameAr: 'أفغانستان', nameEn: 'Afghanistan', dialCode: '+93', flag: '🇦🇫' },
  { code: 'IN', nameAr: 'الهند', nameEn: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'BD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },

  // East & Southeast Asia
  { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'SG', nameAr: 'سنغافورة', nameEn: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'PH', nameAr: 'الفلبين', nameEn: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'TH', nameAr: 'تايلاند', nameEn: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'VN', nameAr: 'فيتنام', nameEn: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'CN', nameAr: 'الصين', nameEn: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', nameAr: 'اليابان', nameEn: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', dialCode: '+82', flag: '🇰🇷' },

  // Europe & UK
  { code: 'GB', nameAr: 'المملكة المتحدة (بريطانيا)', nameEn: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', nameAr: 'بلجيكا', nameEn: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'SE', nameAr: 'السويد', nameEn: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', nameAr: 'النرويج', nameEn: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', nameAr: 'الدنمارك', nameEn: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', nameAr: 'فنلندا', nameEn: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'AT', nameAr: 'النمسا', nameEn: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'IE', nameAr: 'أيرلندا', nameEn: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'PT', nameAr: 'البرتغال', nameEn: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'GR', nameAr: 'اليونان', nameEn: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'PL', nameAr: 'بولندا', nameEn: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'RO', nameAr: 'رومانيا', nameEn: 'Romania', dialCode: '+40', flag: '🇷🇴' },
  { code: 'CZ', nameAr: 'التشيك', nameEn: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', nameAr: 'المجر', nameEn: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
  { code: 'CY', nameAr: 'قبرص', nameEn: 'Cyprus', dialCode: '+357', flag: '🇨🇾' },
  { code: 'RU', nameAr: 'روسيا', nameEn: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'UA', nameAr: 'أوكرانيا', nameEn: 'Ukraine', dialCode: '+380', flag: '🇺🇦' },
  { code: 'BA', nameAr: 'البوسنة والهرسك', nameEn: 'Bosnia', dialCode: '+387', flag: '🇧🇦' },
  { code: 'RS', nameAr: 'صربيا', nameEn: 'Serbia', dialCode: '+381', flag: '🇷🇸' },

  // Americas
  { code: 'US', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', nameAr: 'كندا', nameEn: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'MX', nameAr: 'المكسيك', nameEn: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'AR', nameAr: 'الأرجنتين', nameEn: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CO', nameAr: 'كولومبيا', nameEn: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'CL', nameAr: 'تشيلي', nameEn: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'PE', nameAr: 'بيرو', nameEn: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'VE', nameAr: 'فنزويلا', nameEn: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },

  // Africa
  { code: 'ZA', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', nameAr: 'نيجيريا', nameEn: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', nameAr: 'كينيا', nameEn: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', nameAr: 'غانا', nameEn: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'ET', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'SN', nameAr: 'السنغال', nameEn: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', nameAr: 'ساحل العاج', nameEn: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮' },
  { code: 'TZ', nameAr: 'تنزانيا', nameEn: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'UG', nameAr: 'أوغندا', nameEn: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'CM', nameAr: 'الكاميرون', nameEn: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },

  // Oceania
  { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Saudi Arabia +966
