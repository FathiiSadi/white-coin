import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'English' | 'Arabic';

interface Translations {
  [key: string]: {
    English: string;
    Arabic: string;
  };
}

const translations: Translations = {
  // Navigation
  dashboard: { English: 'Detail View', Arabic: 'عرض التفاصيل' },
  plan: { English: 'Financial Plan', Arabic: 'الخطة المالية' },
  goals: { English: 'Savings Goals', Arabic: 'أهداف الادخار' },
  roundup: { English: 'Round Up', Arabic: 'تقريب المعاملات' },
  settings: { English: 'Settings', Arabic: 'الإعدادات' },
  sign_out: { English: 'Sign Out', Arabic: 'تسجيل الخروج' },
  profile: { English: 'Profile', Arabic: 'الملف الشخصي' },
  dependents: { English: 'Dependents', Arabic: 'المعالين' },
  income_sources: { English: 'Income Sources', Arabic: 'مصادر الدخل' },
  loading: { English: 'Loading...', Arabic: 'جاري التحميل...' },
  
  // Dashboard
  welcome_back: { English: 'Welcome back.', Arabic: 'مرحباً بعودتك.' },
  financial_summary: { English: 'Here is your financial summary.', Arabic: 'إليك ملخصك المالي.' },
  add_transaction: { English: 'Add Transaction', Arabic: 'إضافة معاملة' },
  total_balance: { English: 'Total Balance', Arabic: 'الرصيد الإجمالي' },
  monthly_income: { English: 'Monthly Income', Arabic: 'الدخل الشهرى' },
  monthly_expenses: { English: 'Monthly Expenses', Arabic: 'المصاريف الشهرية' },
  savings_progress: { English: 'Savings Progress', Arabic: 'التقدم في الادخار' },
  smart_insight: { English: 'Smart Insight', Arabic: 'رؤية ذكية' },
  ask_ai: { English: 'Ask AI', Arabic: 'اسأل الذكاء الاصطناعي' },
  saved_this_week: { English: 'Saved this week', Arabic: 'تم ادخاره هذا الأسبوع' },
  spending_categories: { English: 'Spending Categories', Arabic: 'فئات الإنفاق' },
  recent_transactions: { English: 'Recent Transactions', Arabic: 'المعاملات الأخيرة' },
  view_all: { English: 'View All', Arabic: 'عرض الكل' },
  no_transactions: { English: 'No transactions found.', Arabic: 'لم يتم العثور على معاملات.' },
  
  // Transaction Modal
  amount: { English: 'Amount', Arabic: 'المبلغ' },
  category: { English: 'Category', Arabic: 'الفئة' },
  description: { English: 'Description', Arabic: 'الوصف' },
  cancel: { English: 'Cancel', Arabic: 'إلغاء' },
  save: { English: 'Save', Arabic: 'حفظ' },
  saving: { English: 'Saving...', Arabic: 'جاري الحفظ...' },
  
  // Round Up
  roundup_title: { English: 'Round Up Savings', Arabic: 'مدخرات التقريب' },
  roundup_desc: { English: 'Automatically save the spare change from your transactions.', Arabic: 'ادخر الفكة تلقائياً من معاملاتك.' },
  roundup_amount: { English: 'Round up to the nearest', Arabic: 'التقريب لأقرب' },
  enable_roundup: { English: 'Enable Round Up', Arabic: 'تفعيل التقريب' },
  custom_amount: { English: 'Custom Amount', Arabic: 'مبلغ مخصص' },
  projected_savings: { English: 'Projected Savings', Arabic: 'المدخرات المتوقعة' },
  estimated_per_month: { English: 'Estimated per month', Arabic: 'مقدر شهرياً' },
  did_you_know: { English: 'Did you know?', Arabic: 'هل تعلم؟' },
  roundup_tip: { English: 'Rounding up to the nearest $5.00 can help you reach your goals 3x faster than the standard $1.00 setting.', Arabic: 'التقريب لأقرب 5.00 يمكن أن يساعدك في الوصول إلى أهدافك أسرع بـ 3 مرات من التقريب لـ 1.00.' },
  emergency_fund_tip: { English: 'Round-up savings are automatically transferred to your Emergency Fund savings goal.', Arabic: 'تُنقل مدخرات التقريب تلقائياً إلى هدف صندوق الطوارئ الخاص بك.' },

  // Income Sources
  add_source: { English: 'Add Source', Arabic: 'إضافة مصدر' },
  manage_revenue: { English: 'Manage your recurring revenue streams.', Arabic: 'إدارة تدفقات الإيرادات المتكررة.' },
  source_name: { English: 'Source Name', Arabic: 'اسم المصدر' },
  income_type: { English: 'Income Type', Arabic: 'نوع الدخل' },
  frequency: { English: 'Frequency', Arabic: 'التكرار' },
  start_date: { English: 'Start Date', Arabic: 'تاريخ البدء' },
  salary: { English: 'Salary', Arabic: 'راتب' },
  freelance: { English: 'Freelance', Arabic: 'عمل حر' },
  investment: { English: 'Investment', Arabic: 'استثمار' },
  other: { English: 'Other', Arabic: 'أخرى' },
  monthly: { English: 'Monthly', Arabic: 'شهرياً' },
  weekly: { English: 'Weekly', Arabic: 'أسبوعياً' },
  one_time: { English: 'One-time', Arabic: 'مرة واحدة' },

  // Dependents
  manage_family: { English: 'Manage your family members and dependents.', Arabic: 'إدارة أفراد عائلتك والمعالين.' },
  add_dependent: { English: 'Add Dependent', Arabic: 'إضافة معال' },
  relationship: { English: 'Relationship', Arabic: 'العلاقة' },
  dob: { English: 'Date of Birth', Arabic: 'تاريخ الميلاد' },
  child: { English: 'Child', Arabic: 'طفل' },
  spouse: { English: 'Spouse', Arabic: 'زوج/زوجة' },
  parent: { English: 'Parent', Arabic: 'والد/والدة' },

  // Profile Settings
  personal_details: { English: 'Personal Details', Arabic: 'التفاصيل الشخصية' },
  profile_info: { English: 'Profile Information', Arabic: 'معلومات الملف الشخصي' },
  full_name: { English: 'Full Name', Arabic: 'الاسم الكامل' },
  email_address: { English: 'Email Address', Arabic: 'البريد الإلكتروني' },
  phone_number: { English: 'Phone Number', Arabic: 'رقم الهاتف' },
  system_language: { English: 'System Language', Arabic: 'لغة النظام' },
  base_currency: { English: 'Base Currency', Arabic: 'العملة الأساسية' },
  interface_theme: { English: 'Interface Theme', Arabic: 'سمة الواجهة' },
  apply_changes: { English: 'Apply Changes', Arabic: 'تطبيق التغييرات' },
  updating: { English: 'Updating...', Arabic: 'جاري التحديث...' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('language') as Language) || 'English'
  );

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'Arabic' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'Arabic' ? 'ar' : 'en';
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};
