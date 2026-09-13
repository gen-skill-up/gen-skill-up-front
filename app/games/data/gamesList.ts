export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  subject: 'math' | 'science' | 'arabic' | 'french' | 'socials' | 'logic';
  subjectLabel: string;
  subjectColor: string;
  grades: number[];
  gradeLabel: string;
  icon: string;
  bannerGradient: string;
  accentBorder: string;
  badge: string;
  xpReward: number;
  gameType: 'custom_page' | 'interactive_runner';
  customUrl?: string;
  gameplayType: 'choice_rush' | 'drag_sort' | 'matching' | 'circuit' | 'fractions' | 'map_quiz' | 'puzzle';
  contentData: {
    instructions: string;
    questions?: Array<{
      id: number;
      prompt: string;
      subPrompt?: string;
      icon?: string;
      options: string[];
      correctAnswer: string | number;
      explanation: string;
      extraVisual?: string;
    }>;
  };
}

export const SUBJECT_FILTERS = [
  { id: 'all', label: 'جميع الألعاب (30)', icon: '🎮', color: 'text-amber-400' },
  { id: 'math', label: 'الرياضيات (7)', icon: '📐', color: 'text-emerald-400' },
  { id: 'science', label: 'الإيقاظ العلمي (6)', icon: '💡', color: 'text-cyan-400' },
  { id: 'arabic', label: 'اللغة العربية (6)', icon: '📝', color: 'text-pink-400' },
  { id: 'french', label: 'اللغة الفرنسية (4)', icon: '🇫🇷', color: 'text-blue-400' },
  { id: 'socials', label: 'تاريخ وجغرافيا ومواطنة (4)', icon: '🇹🇳', color: 'text-yellow-400' },
  { id: 'logic', label: 'المنطق والذكاء (3)', icon: '🧠', color: 'text-purple-400' },
];

export const GRADE_FILTERS = [
  { id: 0, label: 'جميع المستويات' },
  { id: 1, label: 'السنة 1 و 2 ابتدائي' },
  { id: 2, label: 'السنة 3 و 4 ابتدائي' },
  { id: 3, label: 'السنة 5 و 6 ابتدائي' },
];

export const THIRTY_GAMES: GameDefinition[] = [
  // ─── 📐 1. رياضيات وحساب (7 ألعاب) ───
  {
    id: 'attar',
    title: 'دكّان الحي وعمّ صلاح',
    subtitle: 'الحساب الذهني بالدينار والمليم التونسي',
    description: 'عش تجربة دكان الحي مع عمّ صلاح! اجمع العملات التونسية بدقة، ارجع الباقي للزبائن، وادر ميزانيتك بذكاء.',
    subject: 'math',
    subjectLabel: 'رياضيات وحياة يومية',
    subjectColor: 'emerald',
    grades: [1, 2, 3, 4, 5, 6],
    gradeLabel: 'من السنة 1 إلى 6',
    icon: '🛒',
    bannerGradient: 'from-amber-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badge: 'العملة التونسية 🔥',
    xpReward: 25,
    gameType: 'custom_page',
    customUrl: '/games/attar',
    gameplayType: 'choice_rush',
    contentData: { instructions: 'ادفع ثمن السلع وارجع الباقي بالدينار والمليم' }
  },
  {
    id: 'speed-math',
    title: 'سباق الحساب الذهني السريع',
    subtitle: 'تحدي السرعة ضد الساعة بالدينار والعمليات',
    description: 'أجب على أكبر قدر ممكن من عمليات الحساب والمليمات التونسية في 60 ثانية لتفعيل النيترو وتجاوز المنافسين!',
    subject: 'math',
    subjectLabel: 'رياضيات وحساب ذهني',
    subjectColor: 'emerald',
    grades: [1, 2, 3, 4, 5, 6],
    gradeLabel: 'من السنة 1 إلى 6',
    icon: '🏎️',
    bannerGradient: 'from-indigo-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    badge: 'حماسي وسريع ⚡',
    xpReward: 30,
    gameType: 'custom_page',
    customUrl: '/games/speed-math',
    gameplayType: 'choice_rush',
    contentData: { instructions: 'أجب بسرعة قبل انتهاء الوقت' }
  },
  {
    id: 'scale',
    title: 'ميزان الخضار والغلال العجيب',
    subtitle: 'وزن المحاصيل التونسية بالعيارات النحاسية',
    description: 'زن التفاح والتمور والبرتقال التونسي على ميزان الكفتين التقليدي وضع العيارات المناسبة لتحقيق التوازن!',
    subject: 'math',
    subjectLabel: 'قياس وأوزان',
    subjectColor: 'emerald',
    grades: [2, 3, 4, 5],
    gradeLabel: 'السنة 2 إلى 5',
    icon: '⚖️',
    bannerGradient: 'from-purple-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    badge: 'محاكاة فيزيائية 🌟',
    xpReward: 25,
    gameType: 'custom_page',
    customUrl: '/games/scale',
    gameplayType: 'choice_rush',
    contentData: { instructions: 'وازن كفتي الميزان' }
  },
  {
    id: 'pizza-fractions',
    title: 'شيف البيتزا والكسور الذكية',
    subtitle: 'تعلم الكسور (النصف، الربع، الثلث) بالقطع اللذيذة',
    description: 'قسّم البيتزا وفطائر الطابونة التونسية حسب طلب الزبائن لاكتشاف الكسور المتكافئة والجمع البسيط!',
    subject: 'math',
    subjectLabel: 'رياضيات وكسور',
    subjectColor: 'emerald',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '🍕',
    bannerGradient: 'from-orange-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-orange-500/40 hover:border-orange-400',
    badge: 'كسور تفاعلية 🍕',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اختر الكسر الصحيح الذي يعبر عن الجزء المأكول أو الملون!',
      questions: [
        {
          id: 1,
          prompt: 'أكل أحمد قطعتين من أصل 4 قطع بيتزا متساوية. ما هو الكسر الممثل لذلك؟',
          icon: '🍕',
          options: ['2/4 (نصف البيتزا)', '1/4 (ربع البيتزا)', '3/4 (ثلاثة أرباع)', '4/4 (كامل البيتزا)'],
          correctAnswer: '2/4 (نصف البيتزا)',
          explanation: 'قطعتان من أصل 4 تمثلان الكسر 2/4 وهو يكافئ النصف 1/2.'
        },
        {
          id: 2,
          prompt: 'إذا قسمنا طابونة إلى 8 أجزاء متساوية وأخذنا 3 أجزاء، فما هو الكسر؟',
          icon: '🫓',
          options: ['3/8', '5/8', '8/3', '1/8'],
          correctAnswer: '3/8',
          explanation: 'الجزء المأخوذ 3 والمجموع 8، إذن الكسر هو 3/8.'
        },
        {
          id: 3,
          prompt: 'أي الكسرين أكبر: 1/2 أم 1/4؟',
          icon: '⚖️',
          options: ['1/2 أكبر من 1/4', '1/4 أكبر من 1/2', 'متساويان', 'لا يمكن المقارنة'],
          correctAnswer: '1/2 أكبر من 1/4',
          explanation: 'النصف أكبر من الربع لأنك تقسم على عدد أقل من الأجزاء.'
        }
      ]
    }
  },
  {
    id: 'geometry-builder',
    title: 'مهندس الأشكال والمساحات',
    subtitle: 'اكتشف المثلث، المربع، المستطيل وحساب المحيط',
    description: 'تعرف على خصائص المضلعات، عدد الأضلاع والرؤوس، واحسب محيط ومساحة الحدائق والملاعب!',
    subject: 'math',
    subjectLabel: 'هندسة وقياس',
    subjectColor: 'emerald',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '📐',
    bannerGradient: 'from-teal-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-teal-500/40 hover:border-teal-400',
    badge: 'هندسة ذكية 📐',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'أجب عن أسئلة المهندس الصغير حول الأشكال والمحيطات!',
      questions: [
        {
          id: 1,
          prompt: 'مربع طول ضلعه 5 سم. ما هو محيطه؟ (المحيط = الضلع × 4)',
          icon: '🟦',
          options: ['20 سم', '25 سم', '15 سم', '10 سم'],
          correctAnswer: '20 سم',
          explanation: 'محيط المربع = 5 × 4 = 20 سم.'
        },
        {
          id: 2,
          prompt: 'كم عدد أضلاع ورؤوس الشكل الخماسي المنتظم؟',
          icon: '⬟',
          options: ['5 أضلاع و 5 رؤوس', '4 أضلاع و 4 رؤوس', '6 أضلاع و 6 رؤوس', '5 أضلاع و 4 رؤوس'],
          correctAnswer: '5 أضلاع و 5 رؤوس',
          explanation: 'الشكل الخماسي له 5 أضلاع مستقيمة و 5 رؤوس.'
        }
      ]
    }
  },
  {
    id: 'clock-master',
    title: 'حارس الوقت والساعة الذكية',
    subtitle: 'قراءة الساعة بالعقارب والرقمية وحساب المدد الزمنية',
    description: 'اضبط عقارب الساعة، تعلم قراءة الدقائق والساعات، واحسب مدة الرحلات والدروس المدرسية!',
    subject: 'math',
    subjectLabel: 'قياس الزمن والوقت',
    subjectColor: 'emerald',
    grades: [1, 2, 3, 4],
    gradeLabel: 'السنة 1 إلى 4',
    icon: '⏰',
    bannerGradient: 'from-amber-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badge: 'الوقت والزمن ⏱️',
    xpReward: 25,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اختر التوقيت الصحيح المعروض على الساعة!',
      questions: [
        {
          id: 1,
          prompt: 'كم دقيقة في الساعة الواحدة الكاملة؟',
          icon: '⏱️',
          options: ['60 دقيقة', '30 دقيقة', '100 دقيقة', '24 دقيقة'],
          correctAnswer: '60 دقيقة',
          explanation: 'الساعة الواحدة = 60 دقيقة، ونصف الساعة = 30 دقيقة.'
        },
        {
          id: 2,
          prompt: 'إذا كان العقرب الصغير يشير إلى 3 والعقرب الطويل إلى 12، فكم الساعة؟',
          icon: '🕒',
          options: ['الساعة الثالثة تماماً (03:00)', 'الساعة الثانية عشرة', 'الساعة الثالثة والنصف', 'الساعة التاسعة'],
          correctAnswer: 'الساعة الثالثة تماماً (03:00)',
          explanation: 'العقرب الصغير للساعات (3) والطويل عند 12 يعني تمام الساعة.'
        },
        {
          id: 3,
          prompt: 'بدأت حصة الرياضيات على الساعة 08:00 وانتهت على 09:00. كم استغرقت الحصة؟',
          icon: '⏳',
          options: ['ساعة واحدة (60 دقيقة)', 'ساعتان', '30 دقيقة', '45 دقيقة'],
          correctAnswer: 'ساعة واحدة (60 دقيقة)',
          explanation: 'من 08:00 إلى 09:00 هي مدة ساعة واحدة بالتمام.'
        }
      ]
    }
  },
  {
    id: 'decimal-market',
    title: 'سوق الأعداد العشرية والتخفيضات',
    subtitle: 'الفاصلة العشرية، الحساب التجاري والتخفيضات 20% و 50%',
    description: 'تسوّق في السوق الكبيرة، احسب قيمة التخفيضات والنسب المئوية والعمليات ذات الفاصلة!',
    subject: 'math',
    subjectLabel: 'أعداد عشرية ونسب',
    subjectColor: 'emerald',
    grades: [5, 6],
    gradeLabel: 'السنة 5 و 6 إعدادي',
    icon: '🏷️',
    bannerGradient: 'from-emerald-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    badge: 'تخفيضات وحساب 📊',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'احسب السعر بعد التخفيض أو ناتج العملية العشرية!',
      questions: [
        {
          id: 1,
          prompt: 'ما ناتج جمع العددين العشريين: 3.5 + 2.25؟',
          icon: '➕',
          options: ['5.75', '5.50', '6.00', '5.25'],
          correctAnswer: '5.75',
          explanation: '3.50 + 2.25 = 5.75.'
        },
        {
          id: 2,
          prompt: 'حذاء رياضي سعره 100 دينار مع تخفيض بنسبة 50%. كم يصبح ثمنه؟',
          icon: '👟',
          options: ['50 دينار', '75 دينار', '20 دينار', '80 دينار'],
          correctAnswer: '50 دينار',
          explanation: 'تخفيض 50% يعني نصف الثمن تماماً (100 ÷ 2 = 50 دينار).'
        },
        {
          id: 3,
          prompt: 'ما ناتج ضرب 4.5 × 10؟',
          icon: '✖️',
          options: ['45', '450', '4.50', '0.45'],
          correctAnswer: '45',
          explanation: 'عند الضرب في 10، نزحزح الفاصلة مرتبة واحدة نحو اليمين.'
        }
      ]
    }
  },

  // ─── 💡 2. إيقاظ علمي وفيزياء (6 ألعاب) ───
  {
    id: 'circuit-lab',
    title: 'مختبر الدارة الكهربائية العجيب',
    subtitle: 'أضئ المصباح عبر توصيل البطارية والقاطع والأسلاك',
    description: 'تعرف على عناصر الدارة الكهربائية البسيطة والمواد الناقلة والعازلة للكهرباء.',
    subject: 'science',
    subjectLabel: 'إيقاظ علمي وفيزياء',
    subjectColor: 'cyan',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '⚡',
    bannerGradient: 'from-cyan-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
    badge: 'طاقة وتجارب 💡',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اختر العنصر المناسب لإنارة المصباح ومعرفة أسرار الكهرباء!',
      questions: [
        {
          id: 1,
          prompt: 'ما الذي يوفّر الطاقة الكهربائية في الدارة الكهربائية البسيطة؟',
          icon: '🔋',
          options: ['المولد (البطارية)', 'المصباح', 'القاطع', 'الأسلاك النحاسية'],
          correctAnswer: 'المولد (البطارية)',
          explanation: 'البطارية هي مصدر الطاقة الكهربائية في الدارة.'
        },
        {
          id: 2,
          prompt: 'أي المواد التالية تُعتبر ناقلاً جيداً للكهرباء؟',
          icon: '🔌',
          options: ['سلك من النحاس', 'قطعة خشب جافة', 'مسطرة بلاستيكية', 'قطعة قماش'],
          correctAnswer: 'سلك من النحاس',
          explanation: 'المعادن مثل النحاس والحديد والفضة مواد ناقلة للكهرباء.'
        }
      ]
    }
  },
  {
    id: 'plant-lifecycle',
    title: 'رحلة بذرة الزيتون التونسية',
    subtitle: 'دورة حياة النبات والإنبات والتركيب الضوئي',
    description: 'رافق بذرة الزيتون من حبة صغيرة تحت التربة حتى تصبح شجرة خضراء مورقة تنتج الزيتون!',
    subject: 'science',
    subjectLabel: 'علوم أحياء ونبات',
    subjectColor: 'cyan',
    grades: [1, 2, 3, 4],
    gradeLabel: 'السنة 1 إلى 4',
    icon: '🌱',
    bannerGradient: 'from-emerald-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    badge: 'طبيعة تونسية 🫒',
    xpReward: 25,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'تعرف على مراحل نمو النبات وشروط الإنبات السليمة!',
      questions: [
        {
          id: 1,
          prompt: 'ما هي الشروط الأساسية التي تحتاجها البذرة لتنبت؟',
          icon: '💧',
          options: ['الماء والهواء والحرارة المناسبة', 'الظلام الشديد فقط', 'الرياح القوية', 'الجليد'],
          correctAnswer: 'الماء والهواء والحرارة المناسبة',
          explanation: 'تحتاج البذرة إلى الرطوبة والأكسجين والحرارة المعتدلة.'
        }
      ]
    }
  },
  {
    id: 'body-organs',
    title: 'مستكشف جسم الإنسان والحواس',
    subtitle: 'أعضاء الجسم ووظائف القلب والرئتين والحواس الخمس',
    description: 'رحلة تفاعلية ممتعة داخل جسم الإنسان لاكتشاف كيفية عمل الأعضاء وأهمية الغذاء الصحي.',
    subject: 'science',
    subjectLabel: 'صحة وجسم الإنسان',
    subjectColor: 'cyan',
    grades: [2, 3, 4, 5],
    gradeLabel: 'السنة 2 إلى 5',
    icon: '🫀',
    bannerGradient: 'from-rose-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-rose-500/40 hover:border-rose-400',
    badge: 'صحة وحياة 🩺',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'أجب عن أسئلة الطبيب الصغير حول أعضاء الجسم ووظائفها!',
      questions: [
        {
          id: 1,
          prompt: 'أي عضو مسؤول عن ضخ الدم المحمل بالأكسجين لجميع أنحاء الجسم؟',
          icon: '❤️',
          options: ['القلب', 'المعدة', 'الكبد', 'الرئة'],
          correctAnswer: 'القلب',
          explanation: 'القلب عضلة قوية تضخ الدم بدون توقف.'
        }
      ]
    }
  },
  {
    id: 'food-chain',
    title: 'سفاري السلسلة الغذائية',
    subtitle: 'المنتج، المستهلك، المفترس والفريسة في البيئة التونسية',
    description: 'رتب الكائنات الحية في مسار الطاقة الغذائية في الصحراء التونسية وغابات الشمال!',
    subject: 'science',
    subjectLabel: 'بيئة وكائنات حية',
    subjectColor: 'cyan',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '🦁',
    bannerGradient: 'from-amber-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badge: 'سفاري البيئة 🌿',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اختر الحلقة الصحيحة في السلسلة الغذائية التونسية!',
      questions: [
        {
          id: 1,
          prompt: 'بأي كائن حي تبدأ دائماً السلسلة الغذائية البرية؟',
          icon: '🌱',
          options: ['النبات الأخضر (الكائن المنتج)', 'الحيوان المفترس', 'الحشرة', 'البكتيريا'],
          correctAnswer: 'النبات الأخضر (الكائن المنتج)',
          explanation: 'النبات هو المنتج الوحيد الذي يصنع غذاءه بنفسه.'
        }
      ]
    }
  },
  {
    id: 'solar-system',
    title: 'رائد الفضاء والنظام الشمسي',
    subtitle: 'الكواكب، دوران الأرض، تعاقب الليل والنهار والفصول الأربعة',
    description: 'انطلق في مكوك الفضاء لاستكشاف كواكب المجموعة الشمسية وأسباب تعاقب الفصول الأربعة!',
    subject: 'science',
    subjectLabel: 'فلك وعلوم الأرض',
    subjectColor: 'cyan',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '🚀',
    bannerGradient: 'from-indigo-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    badge: 'فضاء وكواكب 🪐',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'أجب عن أسئلة رائد الفضاء الصغير حول المجموعة الشمسية!',
      questions: [
        {
          id: 1,
          prompt: 'ما الذي يسبب تعاقب الليل والنهار على كوكب الأرض؟',
          icon: '🌍',
          options: ['دوران الأرض حول نفسها (محورها) كل 24 ساعة', 'دوران الأرض حول الشمس', 'دوران القمر حول الأرض', 'حركة السحب'],
          correctAnswer: 'دوران الأرض حول نفسها (محورها) كل 24 ساعة',
          explanation: 'تدور الأرض حول نفسها خلال 24 ساعة فيتعاقب الليل والنهار.'
        },
        {
          id: 2,
          prompt: 'ما هو أقرب كوكب إلى الشمس في المجموعة الشمسية؟',
          icon: '☀️',
          options: ['عُطارد', 'المريخ', 'الأرض', 'المشتري'],
          correctAnswer: 'عُطارد',
          explanation: 'عطارد هو الكوكب الأقرب للشمس يليه الزهرة ثم الأرض.'
        },
        {
          id: 3,
          prompt: 'كم يستغرق دوران الأرض دورة كاملة حول الشمس؟',
          icon: '🪐',
          options: ['سنة واحدة (365 يوماً وربع)', 'شهر واحد', 'يوم واحد', '100 يوم'],
          correctAnswer: 'سنة واحدة (365 يوماً وربع)',
          explanation: 'دوران الأرض حول الشمس يستغرق سنة كاملة ويسبب تعاقب الفصول الأربعة.'
        }
      ]
    }
  },
  {
    id: 'water-cycle',
    title: 'دورة قطرة الماء العجيبة',
    subtitle: 'التبخر، التكثف، السحب، الأمطار وحالات المادة الثلاث',
    description: 'تتبع قطرة الماء من البحر عبر التبخر في السماء، والتكثف في السحب ثم الهطول كأمطار تروي حقول القمح!',
    subject: 'science',
    subjectLabel: 'مناخ وطبيعة',
    subjectColor: 'cyan',
    grades: [2, 3, 4, 5],
    gradeLabel: 'السنة 2 إلى 5',
    icon: '💧',
    bannerGradient: 'from-blue-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-blue-500/40 hover:border-blue-400',
    badge: 'دورة الماء 🌧️',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'تعرف على مراحل دورة الماء وحالات المادة (صلب، سائل، غاز)!',
      questions: [
        {
          id: 1,
          prompt: 'ماذا يسمى تحول الماء من الحالة السائلة إلى الحالة الغازية (بخار) بفعل حرارة الشمس؟',
          icon: '☀️',
          options: ['التَّبَخُّر', 'التَّجَمُّد', 'التَّكْثِيف', 'الانْصِهَار'],
          correctAnswer: 'التَّبَخُّر',
          explanation: 'التبخر هو تحول الماء من سائل إلى بخار ماء بتأثير الحرارة.'
        },
        {
          id: 2,
          prompt: 'عندما يبرد بخار الماء في طبقات الجو العليا ويتحول إلى قطرات تكون السحب، ماذا تسمى هذه العملية؟',
          icon: '☁️',
          options: ['التَّكَاثُف (التَّكْثِيف)', 'التَّبَخُّر', 'الغَلَيَان', 'التَّسَرُّب'],
          correctAnswer: 'التَّكَاثُف (التَّكْثِيف)',
          explanation: 'التكاثف هو تحول بخار الماء إلى قطرات مائية مشكلة السحب.'
        },
        {
          id: 3,
          prompt: 'الجليد والثلج يمثلان الماء في أي حالة؟',
          icon: '❄️',
          options: ['الحالة الصلبة', 'الحالة السائلة', 'الحالة الغازية', 'الحالة البخارية'],
          correctAnswer: 'الحالة الصلبة',
          explanation: 'الثلج والجليد يمثلان الحالة الصلبة للماء.'
        }
      ]
    }
  },

  // ─── 📝 3. لغة عربية وقواعد (6 ألعاب) ───
  {
    id: 'word-catcher',
    title: 'صائد الكلمات والحروف',
    subtitle: 'لعبة لغوية ممتعة للهجاء والمفردات التونسية',
    description: 'التقط الحروف وفقاعات المعرفة بالترتيب الصحيح لاكتشاف كنوز اللغة والحضارة التونسية.',
    subject: 'arabic',
    subjectLabel: 'لغة عربية وهجاء',
    subjectColor: 'pink',
    grades: [1, 2, 3, 4],
    gradeLabel: 'السنة 1 إلى 4',
    icon: '🎯',
    bannerGradient: 'from-pink-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-pink-500/40 hover:border-pink-400',
    badge: 'فرقعة الحروف 🎈',
    xpReward: 30,
    gameType: 'custom_page',
    customUrl: '/games/word-catcher',
    gameplayType: 'choice_rush',
    contentData: { instructions: 'فرقع الحروف بالترتيب الصحيح' }
  },
  {
    id: 'grammar-detective',
    title: 'المحقق اللغوي (اسم، فعل، حرف)',
    subtitle: 'ميّز بين أقسام الكلمة وأزمنة الأفعال',
    description: 'ساعد المحقق الذكي في تصنيف الكلمات وكشف الأفعال الماضية والمضارعة وحروف الجر!',
    subject: 'arabic',
    subjectLabel: 'قواعد ولغة عربية',
    subjectColor: 'pink',
    grades: [2, 3, 4, 5],
    gradeLabel: 'السنة 2 إلى 5',
    icon: '🕵️‍♂️',
    bannerGradient: 'from-indigo-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    badge: 'نحو وقواعد 📝',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'صنف الكلمة بدقة لمساعدة المحقق اللغوي في حل القضية!',
      questions: [
        {
          id: 1,
          prompt: 'ما هو نوع كلمة "يَرْسُمُ" في الجملة: (يرسمُ التلميذُ لوحةً جميلةً)؟',
          icon: '🎨',
          options: ['فعل مضارع', 'اسم', 'حرف جر', 'اسم إشارة'],
          correctAnswer: 'فعل مضارع',
          explanation: '"يرسم" تدل على حدث يقع في الحاضر.'
        }
      ]
    }
  },
  {
    id: 'hamza-hunt',
    title: 'صياد الهمزات والتاءات',
    subtitle: 'إتقان التاء المربوطة والمفتوحة وهمزة الوصل والقطع',
    description: 'تحدي الإملاء السريع لاختيار التاء أو الهمزة الصحيحة وتجنب الأخطاء الشائعة.',
    subject: 'arabic',
    subjectLabel: 'إملاء ورسم الحروف',
    subjectColor: 'pink',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '🏹',
    bannerGradient: 'from-purple-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    badge: 'إملاء بطل ✍️',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اختر الرسم الإملائي الصحيح للكلمة!',
      questions: [
        {
          id: 1,
          prompt: 'كيف نكتب كلمة "مَدْرَسَـ..." في نهايتها؟',
          icon: '🏫',
          options: ['مَدْرَسَة (تاء مربوطة)', 'مَدْرَسَت (تاء مفتوحة)', 'مَدْرَسَه (هاء فقط)', 'مَدْرَسَا'],
          correctAnswer: 'مَدْرَسَة (تاء مربوطة)',
          explanation: 'تكتب تاء مربوطة لأنها تصح نطقها هاء عند الوقف.'
        }
      ]
    }
  },
  {
    id: 'proverb-puzzle',
    title: 'كنوز الأمثال والحكم التونسية',
    subtitle: 'اكتشف حكمة الأجداد والأمثال الشعبية البليغة',
    description: 'رتب الكلمات لتكوين أمثال وحكم تونسية وعربية مشهورة تعزز الفصاحة والقيم الأخلاقية.',
    subject: 'arabic',
    subjectLabel: 'بلاغة وأدب وثقافة',
    subjectColor: 'pink',
    grades: [4, 5, 6],
    gradeLabel: 'السنة 4 إلى 6',
    icon: '📜',
    bannerGradient: 'from-amber-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badge: 'حكمة وبلاغة 🪶',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'أكمل المثل التونسي أو الحكمة العربية الشهيرة بالكلمة المناسبة!',
      questions: [
        {
          id: 1,
          prompt: 'أكمل المثل التونسي الشهير: "قَطْرَة قَطْرَة، يَحْمِلْ ..."؟',
          icon: '💧',
          options: ['الْوَادِي', 'الْبَحْرُ', 'الْكَأْسُ', 'الْبِئْرُ'],
          correctAnswer: 'الْوَادِي',
          explanation: 'المثل "قطرة قطرة يحمل الواد" يعلمنا الصبر والاستمرارية.'
        }
      ]
    }
  },
  {
    id: 'synonym-antonym',
    title: 'بستان المترادفات والأضداد',
    subtitle: 'إثراء المعجم اللغوي واكتشاف معاني الكلمات المتضادة والمتطابقة',
    description: 'ابحث عن الكلمات المترادفة (نفس المعنى) والكلمات المتضادة لتوسيع رصيدك اللغوي في الإنتاج الكتابي!',
    subject: 'arabic',
    subjectLabel: 'معجم ومفردات',
    subjectColor: 'pink',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '📖',
    bannerGradient: 'from-fuchsia-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-fuchsia-500/40 hover:border-fuchsia-400',
    badge: 'معجم وفصاحة 📚',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اختر المرادف (نفس المعنى) أو الضد (عكس المعنى) المطلوب!',
      questions: [
        {
          id: 1,
          prompt: 'ما هو مرادف كلمة "الشَّجَاعُ" (نفس المعنى)؟',
          icon: '🦁',
          options: ['الْبَسِلُ / الْمِقْدَامُ', 'الْجَبَانُ', 'الْخَائِفُ', 'الضَّعِيفُ'],
          correctAnswer: 'الْبَسِلُ / الْمِقْدَامُ',
          explanation: 'الشجاع والباسل والمقدام كلها كلمات تدل على القوة والجسارة.'
        },
        {
          id: 2,
          prompt: 'ما هو ضد كلمة "الْكَرَمُ والجُودُ" (عكس المعنى)؟',
          icon: '💰',
          options: ['الْبُخْلُ والشُّحُّ', 'السَّخَاءُ', 'الْعَطَاءُ', 'الْفَرَحُ'],
          correctAnswer: 'الْبُخْلُ والشُّحُّ',
          explanation: 'ضد الكرم هو البخل والشح.'
        },
        {
          id: 3,
          prompt: 'ما هو مرادف كلمة "الْمُحَافَظَةُ عَلَى الشَّيْءِ"؟',
          icon: '🛡️',
          options: ['صِيَانَتُهُ وَرِعَايَتُهُ', 'إِهْمَالُهُ', 'تَضْيِيعُهُ', 'تَكْسِيرُهُ'],
          correctAnswer: 'صِيَانَتُهُ وَرِعَايَتُهُ',
          explanation: 'المحافظة على الشيء تعني صيانته ورعايته وحمايته.'
        }
      ]
    }
  },
  {
    id: 'poetry-rhythm',
    title: 'منشد القوافي والشعر المدرسي',
    subtitle: 'إكمال أبيات الشعر التونسي والعربي واكتشاف نغمات القافية',
    description: 'استمتع بأعذب أبيات الشعر التونسي (أبو القاسم الشابي) وأكمل الأبيات بالقوافي الموسيقية السليمة!',
    subject: 'arabic',
    subjectLabel: 'شعر وموسيقى لغوية',
    subjectColor: 'pink',
    grades: [4, 5, 6],
    gradeLabel: 'السنة 4 إلى 6',
    icon: '🎵',
    bannerGradient: 'from-rose-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-rose-500/40 hover:border-rose-400',
    badge: 'شعر وقافية 🪕',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'أكمل بيت الشعر للشاعر التونسي العظيم أبو القاسم الشابي!',
      questions: [
        {
          id: 1,
          prompt: 'أكمل بيت الشابي الخالد: "إِذَا الشَّعْبُ يَوْمًا أَرَادَ الْحَيَاةَ ... فَلَا بُدَّ أَنْ يَسْتَجِيبَ ______"؟',
          icon: '🇹🇳',
          options: ['الْقَدَرُ', 'الْحَجَرُ', 'الشَّجَرُ', 'الْبَصَرُ'],
          correctAnswer: 'الْقَدَرُ',
          explanation: 'من أشهر أبيات الشاعر التونسي أبو القاسم الشابي في إرادة الحياة.'
        },
        {
          id: 2,
          prompt: 'أكمل البيت: "وَلَا بُدَّ لِلَّيْلِ أَنْ يَنْجَلِي ... وَلَا بُدَّ لِلْقَيْدِ أَنْ ______"؟',
          icon: '🕊️',
          options: ['يَنْكَسِرَ', 'يَنْتَشِرَ', 'يَسْتَمِرَّ', 'يَنْحَصِرَ'],
          correctAnswer: 'يَنْكَسِرَ',
          explanation: '"ولا بد للقيد أن ينكسر" رمز للحرية والتفاؤل.'
        },
        {
          id: 3,
          prompt: 'أكمل بيت العلم: "الْعِلْمُ يَبْنِي بُيُوتًا لَا عِمَادَ لَهَا ... وَالْجَهْلُ يَهْدِمُ بَيْتَ ______"؟',
          icon: '🏛️',
          options: ['الْعِزِّ وَالشَّرَفِ', 'الْمَالِ', 'الْحَجَرِ', 'الْخَوْفِ'],
          correctAnswer: 'الْعِزِّ وَالشَّرَفِ',
          explanation: 'بيت شعر شهير يحث على طلب العلم وقيمته العالية.'
        }
      ]
    }
  },

  // ─── 🇫🇷 4. لغة فرنسية (4 ألعاب) ───
  {
    id: 'french-colors-objects',
    title: 'Le Monde des Mots Français',
    subtitle: 'Couleurs, animaux, école et objets du quotidien',
    description: 'Découvre le vocabulaire français de manière ludique et interactive pour briller en classe!',
    subject: 'french',
    subjectLabel: 'Vocabulaire Français',
    subjectColor: 'blue',
    grades: [1, 2, 3, 4],
    gradeLabel: '3ème et 4ème Année',
    icon: '🎨',
    bannerGradient: 'from-blue-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-blue-500/40 hover:border-blue-400',
    badge: 'Vocabulaire 🇫🇷',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'Trouve le mot ou la couleur correcte en français !',
      questions: [
        {
          id: 1,
          prompt: 'Comment dit-on "شمس صفراء" en français ?',
          icon: '☀️',
          options: ['Un soleil jaune', 'Un soleil bleu', 'Une lune rouge', 'Un ciel vert'],
          correctAnswer: 'Un soleil jaune',
          explanation: 'Soleil = شمس, Jaune = أصفر.'
        }
      ]
    }
  },
  {
    id: 'french-verbs-rally',
    title: 'Le Défi des Verbes (Présent)',
    subtitle: 'Être, Avoir et les verbes du 1er groupe (-er)',
    description: 'Conjugue les verbes essentiels en français et maîtrise les terminaisons du présent!',
    subject: 'french',
    subjectLabel: 'Conjugaison & Grammaire',
    subjectColor: 'blue',
    grades: [3, 4, 5, 6],
    gradeLabel: '4ème, 5ème et 6ème',
    icon: '🔤',
    bannerGradient: 'from-indigo-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    badge: 'Conjugaison ⚡',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'Choisis la bonne forme verbale au présent !',
      questions: [
        {
          id: 1,
          prompt: 'Complète : "Nous ______ de bons élèves." (Verbe Être)',
          icon: '🎓',
          options: ['sommes', 'êtes', 'sont', 'suis'],
          correctAnswer: 'sommes',
          explanation: 'Au présent : Nous sommes.'
        }
      ]
    }
  },
  {
    id: 'french-dialogue-cafe',
    title: 'Au Petit Café des Amis',
    subtitle: 'Dialogue, politesse et expressions quotidiennes',
    description: 'Apprends les expressions de politesse et les formules magiques en français (Bonjour, Merci, S\'il vous plaît).',
    subject: 'french',
    subjectLabel: 'Communication & Expression',
    subjectColor: 'blue',
    grades: [2, 3, 4, 5],
    gradeLabel: '3ème à 5ème Année',
    icon: '🥐',
    bannerGradient: 'from-sky-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-sky-500/40 hover:border-sky-400',
    badge: 'Dialogue 💬',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'Complète le dialogue avec la formule appropriée !',
      questions: [
        {
          id: 1,
          prompt: 'Quand quelqu\'un te donne un cadeau, que lui dis-tu ?',
          icon: '🎁',
          options: ['Merci beaucoup !', 'Au revoir !', 'Pardon !', 'Bonne nuit !'],
          correctAnswer: 'Merci beaucoup !',
          explanation: 'On dit "Merci" pour exprimer sa gratitude.'
        }
      ]
    }
  },
  {
    id: 'french-singular-plural',
    title: 'Singulier et Pluriel en Français',
    subtitle: 'Le passage au pluriel avec -s, -x et les accords',
    description: 'Apprends à transformer les noms et adjectifs du singulier au pluriel (un cheval / des chevaux, un livre / des livres)!',
    subject: 'french',
    subjectLabel: 'Orthographe & Grammaire',
    subjectColor: 'blue',
    grades: [3, 4, 5, 6],
    gradeLabel: '4ème à 6ème Année',
    icon: '👥',
    bannerGradient: 'from-blue-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-blue-500/40 hover:border-blue-400',
    badge: 'Accords & Pluriel ✍️',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'Choisis la forme correcte au pluriel !',
      questions: [
        {
          id: 1,
          prompt: 'Quel est le pluriel du mot "Un oiseau" ?',
          icon: '🐦',
          options: ['Des oiseaux (avec -x)', 'Des oiseaus (avec -s)', 'Des oiseau', 'Les oiseau'],
          correctAnswer: 'Des oiseaux (avec -x)',
          explanation: 'Les mots qui se terminent par -eau prennent un -x au pluriel.'
        },
        {
          id: 2,
          prompt: 'Quel est le pluriel de "Un journal" ?',
          icon: '📰',
          options: ['Des journaux', 'Des journals', 'Des journal', 'Les journal'],
          correctAnswer: 'Des journaux',
          explanation: 'La plupart des mots en -al font leur pluriel en -aux.'
        },
        {
          id: 3,
          prompt: 'Complète : "Les petites filles sont ______." (Adjectif Content)',
          icon: '👧',
          options: ['contentes (féminin pluriel)', 'contents', 'contente', 'content'],
          correctAnswer: 'contentes (féminin pluriel)',
          explanation: 'L\'adjectif s\'accorde avec le sujet féminin pluriel (les petites filles).'
        }
      ]
    }
  },

  // ─── 🇹🇳 5. تاريخ وجغرافيا ومواطنة (4 ألعاب) ───
  {
    id: 'tunisia-map-explorer',
    title: 'مستكشف خريطة تونس الخضراء',
    subtitle: 'تعرف على الولايات الـ 24، المعالم والمدن',
    description: 'رحلة جغرافية شيقة عبر تونس من بنزرت وطبرقة شمالاً إلى توزر وتطاوين جنوباً!',
    subject: 'socials',
    subjectLabel: 'جغرافيا تونسية',
    subjectColor: 'yellow',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '🗺️',
    bannerGradient: 'from-amber-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badge: 'خريطة الوطن 🇹🇳',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'أجب عن أسئلة مستكشف الخريطة التونسية!',
      questions: [
        {
          id: 1,
          prompt: 'ما هي عاصمة الجمهورية التونسية وأكبر مدنها؟',
          icon: '🏛️',
          options: ['تُونِس العاصمة', 'صفاقس', 'سوسة', 'القيروان'],
          correctAnswer: 'تُونِس العاصمة',
          explanation: 'تونس العاصمة هي مركز البلاد وعاصمتها الرسمية.'
        }
      ]
    }
  },
  {
    id: 'carthage-time-machine',
    title: 'آلة الزمن: أبطال قرطاج وتونس',
    subtitle: 'حنبعل، ابن خلدون، عليسة وتاريخنا العريق',
    description: 'سافر عبر الزمن واكتشف أمجاد الحضارة القرطاجية والإسلامية والحديثة في تونس!',
    subject: 'socials',
    subjectLabel: 'تاريخ تونس وحضاراتها',
    subjectColor: 'yellow',
    grades: [4, 5, 6],
    gradeLabel: 'السنة 4 إلى 6',
    icon: '🏛️',
    bannerGradient: 'from-amber-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badge: 'تاريخ وأبطال 🛡️',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'أجب عن أسئلة التاريخ واكتشف بطولات أجدادنا التونسيين!',
      questions: [
        {
          id: 1,
          prompt: 'من هي الأميرة الفينيقية التي أسست مدينة قرطاج العظيمة؟',
          icon: '👑',
          options: ['الأميرة عليسة (ديدون)', 'الكاهنة', 'توحيدة بن الشيخ', 'عزيزة عثمانة'],
          correctAnswer: 'الأميرة عليسة (ديدون)',
          explanation: 'أسست عليسة قرطاج سنة 814 قبل الميلاد.'
        }
      ]
    }
  },
  {
    id: 'tunisian-monuments',
    title: 'معالم وطني الخالدة',
    subtitle: 'جامع عقبة بالقيروان، قصر الجم الروماني، متحف باردو ومائدة يوغرطة',
    description: 'استكشف أشهر المعالم التاريخية والأثرية في تونس المصنفة ضمن التراث العالمي لليونسكو!',
    subject: 'socials',
    subjectLabel: 'تراث ومعالم تونسية',
    subjectColor: 'yellow',
    grades: [3, 4, 5, 6],
    gradeLabel: 'السنة 3 إلى 6',
    icon: '🕌',
    bannerGradient: 'from-amber-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badge: 'تراث اليونسكو 🏛️',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'تعرف على المعلم التونسي العريق وموقعه الجغرافي!',
      questions: [
        {
          id: 1,
          prompt: 'في أي مدينة تونسية يقع المدرج الروماني الأثري الضخم (قصر الجم)؟',
          icon: '🏟️',
          options: ['ولاية المهدية (مدينة الجم)', 'ولاية تونس', 'ولاية سوسة', 'ولاية قفصة'],
          correctAnswer: 'ولاية المهدية (مدينة الجم)',
          explanation: 'قصر الجم من أعظم المسارح الرومانية في العالم ويقع بولاية المهدية.'
        },
        {
          id: 2,
          prompt: 'ما هو أقدم جامع إسلامي في المغرب العربي وإفريقيا الذي بناه عقبة بن نافع؟',
          icon: '🕌',
          options: ['جامع عقبة بن نافع بالقيروان', 'جامع الزيتونة بتونس', 'جامع عقبة بالمهدية', 'جامع بورقيبة بالمنستير'],
          correctAnswer: 'جامع عقبة بن نافع بالقيروان',
          explanation: 'جامع القيروان الكبير أسسه الفاتح عقبة بن نافع سنة 50 هجرية.'
        },
        {
          id: 3,
          prompt: 'أين تقع الصخرة الهضبية التاريخية الشامخة "مائدة يوغرطة"؟',
          icon: '⛰️',
          options: ['ولاية الكاف (قلعة سنان)', 'ولاية تطاوين', 'ولاية زغوان', 'ولاية قبلي'],
          correctAnswer: 'ولاية الكاف (قلعة سنان)',
          explanation: 'مائدة يوغرطة معلم طبيعي وتاريخي فريد يقع بالكاف.'
        }
      ]
    }
  },
  {
    id: 'eco-citizenship',
    title: 'البطل البيئي والمواطنة الصالحة',
    subtitle: 'ترشيد استهلاك الماء، فرز النفايات وحماية الطبيعة التونسية',
    description: 'كن بطلاً بيئياً يحافظ على نظافة مدرسته وحيه ويرشّد استهلاك الطاقة والمياه!',
    subject: 'socials',
    subjectLabel: 'تربية مدنية وبيئة',
    subjectColor: 'yellow',
    grades: [2, 3, 4, 5, 6],
    gradeLabel: 'السنة 2 إلى 6',
    icon: '♻️',
    bannerGradient: 'from-emerald-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    badge: 'مواطنة وبيئة 🌿',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اختر السلوك البيئي والمواطني السليم!',
      questions: [
        {
          id: 1,
          prompt: 'ما هو التصرف الصحيح عند غسل الأسنان أو اليدين للحفاظ على الماء؟',
          icon: '🚰',
          options: ['غلق الصنبور أثناء التنظيف وفتحه عند الحاجة فقط', 'ترك الصنبور مفتوحاً طوال الوقت', 'استعمال كميات كبيرة جداً', 'غسل اليدين في النهر'],
          correctAnswer: 'غلق الصنبور أثناء التنظيف وفتحه عند الحاجة فقط',
          explanation: 'الماء ثروة وطنية ثمينة يجب الحفاظ عليها قطرة بقطرة.'
        },
        {
          id: 2,
          prompt: 'ماذا نفعل بالأكياس والقوارير البلاستيكية المستعملة؟',
          icon: '🗑️',
          options: ['رميها في حاوية إعادة التدوير المخصصة للبلاستيك', 'رميها في الغابة أو الشاطئ', 'حرقها في الهواء الطلق', 'رميها في البحر'],
          correctAnswer: 'رميها في حاوية إعادة التدوير المخصصة للبلاستيك',
          explanation: 'إعادة التدوير تحمي كوكبنا وشواطئنا من التلوث.'
        },
        {
          id: 3,
          prompt: 'في المدرسة، من واجب التلميذ الصالح:',
          icon: '🏫',
          options: ['المحافظة على الطاولات والجدران نظيفة ونشر المحبة مع الأصدقاء', 'الكتابة على الجدران', 'إتلاف النباتات', 'إلقاء الأوراق في الساحة'],
          correctAnswer: 'المحافظة على الطاولات والجدران نظيفة ونشر المحبة مع الأصدقاء',
          explanation: 'المدرسة بيتنا الثاني ونظافتها عنوان رقينا.'
        }
      ]
    }
  },

  // ─── 🧠 6. منطق وذكاء وبرمجة (3 ألعاب) ───
  {
    id: 'sudoku-kids',
    title: 'سودوكو الأشكال والأنماط الذكية',
    subtitle: 'تفكير منطقي، اكتشاف الأنماط وإكمال المصفوفات',
    description: 'درّب عقلك على التحليل وحل الألغاز عبر وضع الأشكال في المكان المناسب بدون تكرار في نفس الصف أو العمود!',
    subject: 'logic',
    subjectLabel: 'منطق وذكاء',
    subjectColor: 'purple',
    grades: [2, 3, 4, 5, 6],
    gradeLabel: 'السنة 2 إلى 6',
    icon: '🔢',
    bannerGradient: 'from-purple-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    badge: 'تفكير عبقري 🧠',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اكتشف النمط المنطقي الصحيح لإكمال التسلسل!',
      questions: [
        {
          id: 1,
          prompt: 'ما هو الشكل التالي في هذا النمط: (🔴 🟦 🔴 🟦 🔴 ...)؟',
          icon: '🧩',
          options: ['🟦 (مربع أزرق)', '🔴 (دائرة حمراء)', '⭐ (نجمة صفراء)', '🟢 (دائرة خضراء)'],
          correctAnswer: '🟦 (مربع أزرق)',
          explanation: 'النمط يتبادل بالتناوب بين الدائرة والمربع.'
        }
      ]
    }
  },
  {
    id: 'memory-match',
    title: 'تحدي الذاكرة البصرية الخارقة',
    subtitle: 'مطابقة المفاهيم العلمية والأشكال والرموز',
    description: 'اختبر قوة تركيزك وذاكرتك البصرية عبر مطابقة البطاقات المتشابهة بأقل عدد من الحركات!',
    subject: 'logic',
    subjectLabel: 'ذاكرة وتركيز',
    subjectColor: 'purple',
    grades: [1, 2, 3, 4, 5, 6],
    gradeLabel: 'من السنة 1 إلى 6',
    icon: '🃏',
    bannerGradient: 'from-pink-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-pink-500/40 hover:border-pink-400',
    badge: 'تركيز خارق 👁️',
    xpReward: 30,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'اربط بين كل مفهوم وما يناسبه لتقوية ذاكرتك!',
      questions: [
        {
          id: 1,
          prompt: 'أي بطاقة تطابق معنى "1 دينار تونسي"؟',
          icon: '🪙',
          options: ['1000 مليم', '500 مليم', '100 مليم', '2000 مليم'],
          correctAnswer: '1000 مليم',
          explanation: '1 دينار = 1000 مليم بالضبط.'
        }
      ]
    }
  },
  {
    id: 'maze-logic',
    title: 'متاهة الخوارزمي والمبرمج الصغير',
    subtitle: 'التفكير المنطقي، الاتجاهات (يمين، يسار، أمام) والخوارزميات',
    description: 'ساعد الروبوت الصغير في الوصول إلى كنز المعرفة عبر كتابة وتحديد خطوات الخوارزمية البرمجية الصحيحة!',
    subject: 'logic',
    subjectLabel: 'برمجة وتفكير حاسوبي',
    subjectColor: 'purple',
    grades: [2, 3, 4, 5, 6],
    gradeLabel: 'السنة 2 إلى 6',
    icon: '🤖',
    bannerGradient: 'from-indigo-950/60 via-slate-900 to-slate-900',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    badge: 'مبرمج المستقبل 💻',
    xpReward: 35,
    gameType: 'interactive_runner',
    gameplayType: 'choice_rush',
    contentData: {
      instructions: 'حدد الأمر البرمجي الصحيح لتوجيه الروبوت نحو الهدف!',
      questions: [
        {
          id: 1,
          prompt: 'إذا كان الروبوت ينظر للأمام وأمامه جدار، ماذا يجب أن يفعل لتفاديه؟',
          icon: '🤖',
          options: ['الانعطاف يميناً أو يساراً (استدارة 90 درجة)', 'التقدم للأمام والاصطدام', 'التوقف عن العمل للأبد', 'إطفاء البطارية'],
          correctAnswer: 'الانعطاف يميناً أو يساراً (استدارة 90 درجة)',
          explanation: 'الخوارزمية الذكية تغير الاتجاه عند استشعار وجود عائق.'
        },
        {
          id: 2,
          prompt: 'ماذا تسمى مجموعة الخطوات المتسلسلة والمنظمة لحل مسألة معينة في الحاسوب؟',
          icon: '📜',
          options: ['الْخَوَارِزْمِيَّةُ (Algorithm)', 'اللُّعْبَةُ', 'الشَّاشَةُ', 'الْفَارَةُ'],
          correctAnswer: 'الْخَوَارِزْمِيَّةُ (Algorithm)',
          explanation: 'الخوارزمية سميت نسبة للعالم المسلم محمد بن موسى الخوارزمي.'
        },
        {
          id: 3,
          prompt: 'أمر التكرار في البرمجة (Repeat 4 times: Walk forward) يعني:',
          icon: '🔄',
          options: ['التقدم خطوة للأمام 4 مرات متتالية', 'التقدم خطوة واحدة والتراجع', 'القفز 4 مرات في المكان', 'الرجوع للخلف'],
          correctAnswer: 'التقدم خطوة للأمام 4 مرات متتالية',
          explanation: 'حلقة التكرار توفر الوقت وتنفذ نفس الأمر عدداً محدداً من المرات.'
        }
      ]
    }
  }
];

export const TWENTY_GAMES = THIRTY_GAMES; // Backward compatibility alias
