export const LANGUAGES = [
  { code: "uz", nativeName: "O'zbekcha" },
  { code: "ru", nativeName: "Русский" },
  { code: "en", nativeName: "English" },
  { code: "tr", nativeName: "Türkçe" },
  { code: "fr", nativeName: "Français" },
  { code: "de", nativeName: "Deutsch" },
  { code: "zh", nativeName: "中文" },
  { code: "ko", nativeName: "한국어" },
  { code: "es", nativeName: "Español" },
  { code: "ar", nativeName: "العربية" }
]

export const RTL_LANGS = ["ar"]

const STORAGE_KEY = "app_language"

const translations = {
  uz: {
    profile_title: "Profil",
    stat_achievements: "Yutuqlar",
    stat_categories: "Kategoriyalar",
    stat_images: "Rasmlar",
    streak_days: "{days} kun ketma-ket faollik",
    menu_pdf: "PDF chiqarish",
    menu_settings: "Sozlamalar",
    dark_mode: "Qorong'i rejim",
    menu_language: "Til",
    language_section_title: "Tillar",
    profile_photo: "Profil rasmi",
    change_photo: "Rasm o'zgartirish",
    uploading: "Yuklanmoqda...",
    name_label: "Ism",
    email_label: "Email",
    save: "Saqlash",
    saving: "Saqlanmoqda...",
    menu_admin_panel: "Admin panelga o'tish",
    menu_logout: "Chiqish"
  },
  ru: {
    profile_title: "Профиль",
    stat_achievements: "Достижения",
    stat_categories: "Категории",
    stat_images: "Фото",
    streak_days: "{days} дней подряд активности",
    menu_pdf: "Экспорт в PDF",
    menu_settings: "Настройки",
    dark_mode: "Тёмная тема",
    menu_language: "Язык",
    language_section_title: "Языки",
    profile_photo: "Фото профиля",
    change_photo: "Изменить фото",
    uploading: "Загрузка...",
    name_label: "Имя",
    email_label: "Email",
    save: "Сохранить",
    saving: "Сохранение...",
    menu_admin_panel: "Перейти в админ-панель",
    menu_logout: "Выйти"
  },
  en: {
    profile_title: "Profile",
    stat_achievements: "Achievements",
    stat_categories: "Categories",
    stat_images: "Photos",
    streak_days: "{days}-day activity streak",
    menu_pdf: "Export PDF",
    menu_settings: "Settings",
    dark_mode: "Dark mode",
    menu_language: "Language",
    language_section_title: "Languages",
    profile_photo: "Profile photo",
    change_photo: "Change photo",
    uploading: "Uploading...",
    name_label: "Name",
    email_label: "Email",
    save: "Save",
    saving: "Saving...",
    menu_admin_panel: "Go to admin panel",
    menu_logout: "Log out"
  },
  tr: {
    profile_title: "Profil",
    stat_achievements: "Başarılar",
    stat_categories: "Kategoriler",
    stat_images: "Fotoğraflar",
    streak_days: "{days} günlük aktiflik serisi",
    menu_pdf: "PDF olarak dışa aktar",
    menu_settings: "Ayarlar",
    dark_mode: "Karanlık mod",
    menu_language: "Dil",
    language_section_title: "Diller",
    profile_photo: "Profil fotoğrafı",
    change_photo: "Fotoğrafı değiştir",
    uploading: "Yükleniyor...",
    name_label: "Ad",
    email_label: "E-posta",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    menu_admin_panel: "Yönetici paneline git",
    menu_logout: "Çıkış yap"
  },
  fr: {
    profile_title: "Profil",
    stat_achievements: "Réalisations",
    stat_categories: "Catégories",
    stat_images: "Photos",
    streak_days: "{days} jours d'activité consécutifs",
    menu_pdf: "Exporter en PDF",
    menu_settings: "Paramètres",
    dark_mode: "Mode sombre",
    menu_language: "Langue",
    language_section_title: "Langues",
    profile_photo: "Photo de profil",
    change_photo: "Changer la photo",
    uploading: "Téléchargement...",
    name_label: "Nom",
    email_label: "E-mail",
    save: "Enregistrer",
    saving: "Enregistrement...",
    menu_admin_panel: "Accéder au panneau d'administration",
    menu_logout: "Se déconnecter"
  },
  de: {
    profile_title: "Profil",
    stat_achievements: "Erfolge",
    stat_categories: "Kategorien",
    stat_images: "Fotos",
    streak_days: "{days} Tage in Folge aktiv",
    menu_pdf: "Als PDF exportieren",
    menu_settings: "Einstellungen",
    dark_mode: "Dunkler Modus",
    menu_language: "Sprache",
    language_section_title: "Sprachen",
    profile_photo: "Profilbild",
    change_photo: "Foto ändern",
    uploading: "Wird hochgeladen...",
    name_label: "Name",
    email_label: "E-Mail",
    save: "Speichern",
    saving: "Wird gespeichert...",
    menu_admin_panel: "Zum Admin-Panel",
    menu_logout: "Abmelden"
  },
  zh: {
    profile_title: "个人资料",
    stat_achievements: "成就",
    stat_categories: "类别",
    stat_images: "照片",
    streak_days: "连续活跃 {days} 天",
    menu_pdf: "导出为 PDF",
    menu_settings: "设置",
    dark_mode: "深色模式",
    menu_language: "语言",
    language_section_title: "语言",
    profile_photo: "头像",
    change_photo: "更换照片",
    uploading: "上传中...",
    name_label: "姓名",
    email_label: "邮箱",
    save: "保存",
    saving: "保存中...",
    menu_admin_panel: "进入管理面板",
    menu_logout: "退出登录"
  },
  ko: {
    profile_title: "프로필",
    stat_achievements: "업적",
    stat_categories: "카테고리",
    stat_images: "사진",
    streak_days: "{days}일 연속 활동",
    menu_pdf: "PDF로 내보내기",
    menu_settings: "설정",
    dark_mode: "다크 모드",
    menu_language: "언어",
    language_section_title: "언어",
    profile_photo: "프로필 사진",
    change_photo: "사진 변경",
    uploading: "업로드 중...",
    name_label: "이름",
    email_label: "이메일",
    save: "저장",
    saving: "저장 중...",
    menu_admin_panel: "관리자 패널로 이동",
    menu_logout: "로그아웃"
  },
  es: {
    profile_title: "Perfil",
    stat_achievements: "Logros",
    stat_categories: "Categorías",
    stat_images: "Fotos",
    streak_days: "{days} días de actividad seguidos",
    menu_pdf: "Exportar a PDF",
    menu_settings: "Configuración",
    dark_mode: "Modo oscuro",
    menu_language: "Idioma",
    language_section_title: "Idiomas",
    profile_photo: "Foto de perfil",
    change_photo: "Cambiar foto",
    uploading: "Subiendo...",
    name_label: "Nombre",
    email_label: "Correo",
    save: "Guardar",
    saving: "Guardando...",
    menu_admin_panel: "Ir al panel de administración",
    menu_logout: "Cerrar sesión"
  },
  ar: {
    profile_title: "الملف الشخصي",
    stat_achievements: "الإنجازات",
    stat_categories: "الفئات",
    stat_images: "الصور",
    streak_days: "{days} يومًا من النشاط المتواصل",
    menu_pdf: "تصدير PDF",
    menu_settings: "الإعدادات",
    dark_mode: "الوضع الداكن",
    menu_language: "اللغة",
    language_section_title: "اللغات",
    profile_photo: "صورة الملف الشخصي",
    change_photo: "تغيير الصورة",
    uploading: "جارٍ الرفع...",
    name_label: "الاسم",
    email_label: "البريد الإلكتروني",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    menu_admin_panel: "الانتقال إلى لوحة التحكم",
    menu_logout: "تسجيل الخروج"
  }
}

export function getLanguage() {
  return localStorage.getItem(STORAGE_KEY) || "uz"
}

export function applyLanguage(code) {
  localStorage.setItem(STORAGE_KEY, code)
  document.documentElement.lang = code
  document.documentElement.dir = RTL_LANGS.includes(code) ? "rtl" : "ltr"
}

export function translate(lang, key, params) {
  let str = (translations[lang] && translations[lang][key]) || translations.uz[key] || key
  if (params) {
    Object.keys(params).forEach((k) => {
      str = str.split("{" + k + "}").join(params[k])
    })
  }
  return str
}
