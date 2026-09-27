/* Programme des réunions. Pour un nouveau trimestre, ajoutez un bloc ci-dessous (date au format AAAA-MM-JJ). */
window.RTC_AGENDA = {
  time: "15:30",
  room: { fr: "Salle de projection – Centre culturel Iklyle", en: "Screening room – Iklyle Cultural Centre", ar: "قاعة العرض – المركز الثقافي إكليل" },
  cycles: [
    { month: "2026-09", icon: "🌱", title: "FIND YOUR VOICE",
      goal: { fr: "Reprendre après l'été, retrouver confiance et renforcer sa présence à l'oral.",
              en: "Restart after the summer break, regain confidence and strengthen your speaking presence.",
              ar: "الانطلاق من جديد بعد العطلة الصيفية واستعادة الثقة وتعزيز الحضور الخطابي." },
      sessions: [
        { date: "2026-09-12", theme: "Back to the Stage", obj: { fr: "Confiance et objectifs personnels de prise de parole", en: "Confidence and personal speaking goals", ar: "الثقة والأهداف الشخصية في الخطابة" } },
        { date: "2026-09-19", theme: "Tell Your Story", obj: { fr: "L'art du storytelling", en: "Storytelling", ar: "فن السرد القصصي" } },
        { date: "2026-09-26", theme: "Speak with Confidence", obj: { fr: "Voix, langage corporel et présence scénique", en: "Voice, body language and stage presence", ar: "الصوت ولغة الجسد والحضور على المنصة" } }
      ] },
    { month: "2026-10", icon: "🎯", title: "MASTER YOUR INFLUENCE",
      goal: { fr: "Passer de « bien parler » à communiquer avec clarté et influence.",
              en: "Move from simply speaking well to communicating with clarity and influence.",
              ar: "الانتقال من مجرد التحدث الجيد إلى التواصل بوضوح وتأثير." },
      sessions: [
        { date: "2026-10-03", theme: "The Power of the Message", obj: { fr: "Clarté et structure du discours", en: "Clarity and speech structure", ar: "وضوح الخطاب وبنيته" } },
        { date: "2026-10-10", theme: "Stories Under the Baobab", obj: { fr: "Communication persuasive", en: "Persuasive communication", ar: "التواصل الإقناعي" } },
        { date: "2026-10-17", theme: "Make Your Words Matter", obj: { fr: "Langage percutant et impact émotionnel", en: "Powerful language and emotional impact", ar: "لغة قوية وأثر عاطفي" } }
      ] },
    { month: "2026-11", icon: "👑", title: "LEAD THROUGH COMMUNICATION",
      goal: { fr: "La prise de parole n'est pas qu'une affaire de discours : c'est une compétence de leadership.",
              en: "Public speaking is not only about delivering speeches — it's a leadership skill.",
              ar: "الخطابة ليست مجرد إلقاء خطب، بل مهارة قيادية." },
      sessions: [
        { date: "2026-11-07", theme: "Leaders Speak, People Listen", obj: { fr: "La communication du leader", en: "Leadership communication", ar: "التواصل القيادي" } },
        { date: "2026-11-14", theme: "The Art of Difficult Conversations", obj: { fr: "Communiquer sous pression", en: "Communication under pressure", ar: "التواصل تحت الضغط" } },
        { date: "2026-11-21", theme: "Inspire Action", obj: { fr: "Réunion de clôture : célébrer la progression et tout ce que nous avons appris en trois mois", en: "Closing meeting: celebrating growth and everything learned over three months", ar: "لقاء ختامي للاحتفاء بالتقدّم وبكل ما تعلّمناه خلال ثلاثة أشهر" } }
      ] }
  ]
};
