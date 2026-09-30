/* Assistant du Rabat Toastmasters Club : chatbot sans IA externe (FR / EN / AR) avec dictée vocale optionnelle.
   Pour ajouter une question : ajoutez une entrée dans INTENTS (mots-clés sans accents + réponses fr/en/ar). */
(function(){
  if(window.__rtcChat) return; window.__rtcChat = true;

  var HOME = document.getElementById('agenda') ? '' : 'index.html';
  var WA = 'https://wa.me/212772182258';
  var TEL = '+212 772 182 258';
  var MAP = 'https://www.google.com/maps/dir/?api=1&destination=34.01149,-6.83149';
  var AVIS = 'https://forms.gle/4KZZpSZ37iUzudji7';
  var TMI = 'https://www.toastmasters.org';
  var STORE = 'rtc_chat_v1';

  function L(){ var l = window.RTC_LANG || document.documentElement.lang || 'fr'; return (l==='en'||l==='ar') ? l : 'fr'; }

  var UI = {
    fr:{title:'Assistant du club', sub:'Répond en FR · EN · العربية', ph:'Écrivez votre question…', send:'Envoyer',
        mic:'Dicter ma question', micOn:'Je vous écoute… parlez maintenant', teaser:'Une question sur le club ? Je vous réponds 👋',
        open:"Ouvrir l'assistant du club", close:'Fermer', reset:'Nouvelle conversation',
        micDenied:"Le micro n'est pas autorisé. Autorisez-le dans votre navigateur, ou écrivez simplement votre question.",
        noSpeech:"Je n'ai rien entendu. Appuyez de nouveau sur le micro et parlez juste après le signal."},
    en:{title:'Club assistant', sub:'Answers in FR · EN · العربية', ph:'Type your question…', send:'Send',
        mic:'Dictate my question', micOn:'Listening… speak now', teaser:'A question about the club? Ask me 👋',
        open:'Open the club assistant', close:'Close', reset:'New conversation',
        micDenied:'The microphone is not allowed. Enable it in your browser, or simply type your question.',
        noSpeech:"I didn't hear anything. Tap the microphone again and speak right away."},
    ar:{title:'مساعد النادي', sub:'يجيب بالعربية · français · English', ph:'اكتب سؤالك…', send:'إرسال',
        mic:'أملِ سؤالك بالصوت', micOn:'أستمع إليك… تحدّث الآن', teaser:'لديك سؤال عن النادي؟ أنا هنا 👋',
        open:'افتح مساعد النادي', close:'إغلاق', reset:'محادثة جديدة',
        micDenied:'الميكروفون غير مسموح به. فعّله في المتصفح أو اكتب سؤالك ببساطة.',
        noSpeech:'لم أسمع شيئاً. اضغط على الميكروفون مجدداً وتحدّث مباشرة.'}
  };

  var CHIP = {
    fr:{next:'Prochaine réunion', visit:'Venir en invité', where:'Où ?', cost:'Tarifs', lang:'Langues', format:'Déroulement', join:"M'inscrire", contact:'Contact', tm:"C'est quoi Toastmasters ?", speak:'Dois-je parler ?', agenda:'Programme', benefits:'Pourquoi venir ?'},
    en:{next:'Next meeting', visit:'Visit as a guest', where:'Where?', cost:'Fees', lang:'Languages', format:'Meeting format', join:'Sign up', contact:'Contact', tm:'What is Toastmasters?', speak:'Do I have to speak?', agenda:'Programme', benefits:'Why come?'},
    ar:{next:'اللقاء القادم', visit:'الحضور كضيف', where:'أين؟', cost:'الرسوم', lang:'اللغات', format:'سير اللقاء', join:'التسجيل', contact:'التواصل', tm:'ما هي توستماسترز؟', speak:'هل يجب أن أتكلم؟', agenda:'البرنامج', benefits:'لماذا أحضر؟'}
  };

  /* ---------- petits outils ---------- */
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function act(href,label,ext){ return '<a class="cb-act" href="'+href+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+label+'</a>'; }
  function acts(){ return '<div class="cb-acts">'+Array.prototype.join.call(arguments,'')+'</div>'; }
  function chips(ids,l){ return '<div class="cb-chips">'+ids.map(function(id){return '<button type="button" class="cb-chip" data-intent="'+id+'">'+esc(CHIP[l][id])+'</button>';}).join('')+'</div>'; }
  function lbl(l,fr,en,ar){ return l==='ar'?ar:(l==='en'?en:fr); }
  function btnJoin(l){ return act(HOME+'#inscription', lbl(l,'Réserver ma place','Book my seat','احجز مقعدك')); }
  function btnMap(l){ return act(MAP, lbl(l,'Itinéraire','Directions','الاتجاهات'), true); }
  function btnWa(l){ return act(WA, 'WhatsApp', true); }
  function time(l){ var t=(window.RTC_AGENDA&&window.RTC_AGENDA.time)||'15:30'; if(l==='fr') return t.replace(':','h'); if(l==='en'){var p=t.split(':'),h=+p[0];return (h>12?h-12:h)+':'+p[1]+(h>=12?' pm':' am');} return t; }
  function fmtDate(iso,l){ try{ return new Date(iso+'T12:00:00').toLocaleDateString({fr:'fr-FR',en:'en-GB',ar:'ar-MA'}[l],{weekday:'long',day:'numeric',month:'long'}); }catch(e){ return iso; } }
  function todayIso(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  function nextSession(){
    var A=window.RTC_AGENDA; if(!A||!A.cycles) return null; var t=todayIso(), best=null;
    A.cycles.forEach(function(c){ (c.sessions||[]).forEach(function(s){ if(s.date>=t && (!best||s.date<best.s.date)) best={s:s,c:c}; }); });
    return best;
  }

  /* ---------- base de connaissance ---------- */
  var INTENTS = [
    {id:'next', k:['prochaine reunion','prochaine seance','prochain samedi','samedi prochain','ce samedi','cette semaine','prochaine','prochain','next meeting','next session','upcoming','this saturday','next','theme','sujet de la','topic','القادم','القادمه','المقبل','الموالي','هذا السبت','موضوع'],
     no:['when','agenda'], a:function(l){
      var n=nextSession();
      if(!n) return lbl(l,
        'Nous nous réunissons chaque samedi à <b>'+time(l)+'</b> (12h00 pendant le Ramadan). Le programme du prochain trimestre sera publié très bientôt dans l\'agenda.',
        'We meet every Saturday at <b>'+time(l)+'</b> (12:00 during Ramadan). The next quarter\'s programme will be published soon in the agenda.',
        'نلتقي كل يوم سبت على الساعة <b>'+time(l)+'</b> (12:00 خلال شهر رمضان). سيُنشر برنامج الفصل القادم قريباً في الأجندة.')
        + acts(act(HOME+'#agenda',lbl(l,'Voir l\'agenda','See the agenda','عرض الأجندة')), btnJoin(l));
      var obj=(n.s.obj&&n.s.obj[l])||'';
      return lbl(l,
        'La prochaine réunion a lieu <b>'+fmtDate(n.s.date,l)+'</b> à <b>'+time(l)+'</b>, sur le thème « '+esc(n.s.theme)+' »'+(obj?' ('+esc(obj)+')':'')+'. Rendez-vous au Centre culturel Iklyle, à Rabat. Les invités sont les bienvenus !',
        'The next meeting is on <b>'+fmtDate(n.s.date,l)+'</b> at <b>'+time(l)+'</b>, themed “'+esc(n.s.theme)+'”'+(obj?' ('+esc(obj)+')':'')+'. See you at the Iklyle Cultural Centre in Rabat. Guests are welcome!',
        'اللقاء القادم يوم <b>'+fmtDate(n.s.date,l)+'</b> على الساعة <b>'+time(l)+'</b>، تحت عنوان «'+esc(n.s.theme)+'»'+(obj?' ('+esc(obj)+')':'')+'. موعدنا في المركز الثقافي إكليل بالرباط. الضيوف مرحّب بهم!')
        + acts(btnJoin(l), btnMap(l));
    }},
    {id:'when', k:['quand','quelle heure','heure','horaire','quel jour','jour','samedi','when','what time','=time','=day','saturday','hour','متي','موعد','الساعه','ساعه','السبت','يوم','توقيت','وقت'],
     a:function(l){ return lbl(l,
        'Nous nous réunissons <b>chaque samedi à '+time(l)+'</b>, et à <b>12h00 pendant le Ramadan</b>. Une réunion dure environ deux heures.',
        'We meet <b>every Saturday at '+time(l)+'</b>, and at <b>12:00 during Ramadan</b>. A meeting lasts about two hours.',
        'نلتقي <b>كل يوم سبت على الساعة '+time(l)+'</b>، وعلى الساعة <b>12:00 خلال رمضان</b>. يدوم اللقاء حوالي ساعتين.')
        + chips(['next','where','agenda'],l); }},
    {id:'where', k:['ou se','ou est','ou a lieu','ou ca','c est ou','adresse','lieu','salle','se trouve','situe','localisation','itineraire','acces','=ou','iklyle','iklyl','centre','center','where','address','location','venue','directions','map','اين','عنوان','مكان','موقع','المركز','القاعه','اكليل'],
     a:function(l){ return lbl(l,
        'Les réunions ont lieu au <b>Centre culturel Iklyle – Dar Chabab El Kheir</b>, avenue Allal Al Fassi, Yacoub El Mansour, Rabat 10100, dans la salle de projection.',
        'Meetings take place at the <b>Iklyle Cultural Centre – Dar Chabab El Kheir</b>, Allal Al Fassi Avenue, Yacoub El Mansour, Rabat 10100, in the screening room.',
        'تُعقد اللقاءات في <b>المركز الثقافي إكليل – دار الشباب الخير</b>، شارع علال الفاسي، يعقوب المنصور، الرباط 10100، بقاعة العرض.')
        + acts(btnMap(l)); }},
    {id:'visit', k:['invite','visite','visiter','gratuit','gratuite','essayer','decouvrir','premiere fois','premiere visite','assister','venir','guest','visit','free','try','attend','first time','come','ضيف','زياره','مجان','مجانا','مجانيه','حضور','احضر','تجربه'],
     a:function(l){ return lbl(l,
        'Oui, vous pouvez venir en <b>invité gratuitement</b>, autant de fois que nécessaire avant de décider d\'adhérer, et <b>sans obligation de parler</b>. Réservez simplement votre place avec le formulaire : un membre du bureau vous confirme la date.',
        'Yes, you can come as a <b>guest for free</b>, as many times as you need before deciding to join, and <b>with no obligation to speak</b>. Just book your seat with the form: a board member will confirm the date.',
        'نعم، يمكنك الحضور <b>كضيف مجاناً</b>، وبقدر ما تحتاج قبل أن تقرّر الانضمام، و<b>دون أي التزام بالكلام</b>. احجز مقعدك عبر الاستمارة وسيؤكد لك أحد أعضاء المكتب الموعد.')
        + acts(btnJoin(l)) + chips(['next','where'],l); }},
    {id:'cost', k:['prix','tarif','cout','combien','cotisation','payer','paye','frais','adhesion','=dh','dirham','euro','argent','price','cost','fee','dues','how much','pay','membership','ثمن','سعر','تكلفه','اشتراك','رسوم','=كم','واجب','مبلغ','درهم'],
     a:function(l){ return lbl(l,
        'La <b>visite en invité est gratuite</b>. L\'adhésion comprend la cotisation à Toastmasters International et les frais du club ; notre <b>VP Adhésions, Afaf Boulanouar</b>, vous communique le montant en vigueur.',
        'The <b>guest visit is free</b>. Membership includes the Toastmasters International dues and the club fees; our <b>VP Membership, Afaf Boulanouar</b>, will give you the current amount.',
        '<b>الحضور كضيف مجاني</b>. يشمل الانخراط واجب الاشتراك في توستماسترز الدولية ورسوم النادي، وستخبرك <b>نائبة الرئيس المكلفة بالعضوية، عفاف بولنوار</b>، بالمبلغ المعمول به.')
        + acts(btnWa(l), btnJoin(l)); }},
    {id:'join', k:['rejoindre','inscrire','inscription','devenir membre','adherer','reserver','reservation','membre','join','sign up','register','become a member','member','booking','book','انضم','انضمام','تسجيل','عضو','عضويه','اسجل','حجز','احجز'],
     a:function(l){ return lbl(l,
        'C\'est simple : <b>1.</b> inscrivez-vous comme invité avec le formulaire, <b>2.</b> assistez à une réunion, <b>3.</b> si l\'ambiance vous plaît, adhérez via le club et commencez votre parcours Pathways.',
        'It\'s simple: <b>1.</b> sign up as a guest with the form, <b>2.</b> attend a meeting, <b>3.</b> if you like it, join through the club and start your Pathways journey.',
        'الأمر بسيط: <b>1.</b> سجّل كضيف عبر الاستمارة، <b>2.</b> احضر لقاءً، <b>3.</b> إن أعجبتك الأجواء، انخرط عبر النادي وابدأ مسارك في برنامج Pathways.')
        + acts(btnJoin(l)) + chips(['cost'],l); }},
    {id:'lang', k:['langue','francais','anglais','arabe','english','french','arabic','language','darija','en quelle langue','لغه','لغات','اللغه','العربيه','الفرنسيه','الانجليزيه','الانكليزيه','الدارجه'],
     a:function(l){ return lbl(l,
        'Nos réunions se tiennent en <b>trois langues : français, anglais et arabe</b>. Chacun s\'exerce dans la langue de son choix.',
        'Our meetings are held in <b>three languages: French, English and Arabic</b>. Everyone practises in the language of their choice.',
        'تُعقد لقاءاتنا <b>بثلاث لغات: الفرنسية والإنجليزية والعربية</b>، ويتدرّب كل واحد باللغة التي يختارها.'); }},
    {id:'speak', k:['parler','oblige','obligatoire','force','trac','stress','peur','timide','angoisse','must i speak','have to speak','do i need to speak','nervous','shy','afraid','fear','scared','anxious','هل يجب','خوف','خجل','رهبه','اتكلم','اتحدث','قلق'],
     a:function(l){ return lbl(l,
        'Pas du tout ! En tant qu\'invité, vous pouvez <b>simplement observer</b>. Si l\'envie vous prend, vous pourrez tenter un Table Topic d\'une à deux minutes. Beaucoup de nos membres sont arrivés avec le trac : ils animent aujourd\'hui des réunions.',
        'Not at all! As a guest you can <b>simply observe</b>. If you feel like it, you can try a one-to-two-minute Table Topic. Many of our members arrived nervous, and they now run meetings.',
        'إطلاقاً! بصفتك ضيفاً يمكنك <b>الاكتفاء بالمشاهدة</b>، وإن رغبت يمكنك تجربة ارتجال لمدة دقيقة أو دقيقتين. كثير من أعضائنا جاؤوا وهم يشعرون بالرهبة، وهم اليوم ينشّطون اللقاءات.')
        + chips(['visit','format'],l); }},
    {id:'level', k:['niveau','debutant','experience','prerequis','competence','beginner','level','experience','skills','requirement','مستوي','مبتدئ','خبره','شروط'],
     a:function(l){ return lbl(l,
        'Aucun niveau n\'est requis. Débutants, étudiants, cadres, entrepreneurs : chacun progresse à son rythme, avec un mentor s\'il le souhaite.',
        'No level is required. Beginners, students, professionals, entrepreneurs: everyone progresses at their own pace, with a mentor if they wish.',
        'لا يُشترط أي مستوى. مبتدئون، طلبة، أطر، مقاولون: كل واحد يتقدّم بإيقاعه، مع مرشد إن أراد.'); }},
    {id:'age', k:['=age','=ans','etudiant','enfant','jeune','lyceen','mineur','student','young','kids','teen','عمر','طالب','=سن','شباب','اطفال'],
     a:function(l){ return lbl(l,
        'Le club accueille des adultes de tous horizons, notamment beaucoup d\'étudiants et de jeunes actifs. Pour une personne de moins de 18 ans, contactez d\'abord le bureau pour voir ce qui est possible.',
        'The club welcomes adults from all walks of life, including many students and young professionals. For anyone under 18, please contact the board first to see what is possible.',
        'يرحّب النادي بالبالغين من جميع الآفاق، ومن بينهم كثير من الطلبة والشباب. بالنسبة لمن هم دون 18 سنة، يُرجى التواصل مع المكتب أولاً.')
        + acts(btnWa(l)); }},
    {id:'tm', k:['toastmasters international','toastmaster','quoi toastmasters','organisation','smedley','1924','what is toastmasters','about toastmasters','organization','توستماسترز','توست ماسترز','منظمه'],
     a:function(l){ return lbl(l,
        '<b>Toastmasters International</b> est une organisation éducative à but non lucratif fondée en 1924 par Ralph C. Smedley. Elle compte plus de 270 000 membres dans 14 000 clubs et 150 pays, pour apprendre à parler en public et à diriger. Notre club en fait partie depuis 2018.',
        '<b>Toastmasters International</b> is a non-profit educational organisation founded in 1924 by Ralph C. Smedley. It has over 270,000 members in 14,000 clubs across 150 countries, helping people learn public speaking and leadership. Our club has been part of it since 2018.',
        '<b>توستماسترز الدولية</b> منظمة تعليمية غير ربحية أسسها رالف سميدلي سنة 1924، وتضم أكثر من 270 ألف عضو في 14 ألف نادٍ و150 دولة، لتعلّم الخطابة والقيادة. نادينا جزء منها منذ 2018.')
        + acts(act(HOME+'#toastmasters',lbl(l,'En savoir plus','Learn more','اعرف المزيد')), act(TMI,'toastmasters.org',true)); }},
    {id:'benefits', k:['pourquoi','avantage','benefice','apporte','interet','progresser','confiance','ameliorer','why','benefit','gain','improve','confidence','لماذا','فائده','فوائد','ثقه','تحسين'],
     a:function(l){ return lbl(l,
        'Au club, on apprend en faisant : <b>discours préparés</b>, <b>improvisation</b> (Table Topics), <b>évaluations</b> bienveillantes et <b>leadership</b> en tenant des rôles. Résultat : plus de confiance, une voix et une gestuelle maîtrisées, et l\'habitude de parler devant un public.',
        'At the club you learn by doing: <b>prepared speeches</b>, <b>impromptu speaking</b> (Table Topics), supportive <b>evaluations</b> and <b>leadership</b> through meeting roles. The result: more confidence, better voice and body language, and the habit of speaking in front of an audience.',
        'في النادي نتعلّم بالممارسة: <b>خطب مُعدّة</b>، <b>ارتجال</b>، <b>تقييمات</b> بنّاءة و<b>قيادة</b> عبر أداء الأدوار. والنتيجة: ثقة أكبر، تحكّم في الصوت ولغة الجسد، وتعوّد على الحديث أمام الجمهور.')
        + chips(['visit','format'],l); }},
    {id:'format', k:['deroulement','deroule','se passe','comment ca marche','duree','combien de temps','dure','structure','how does','how it works','format','how long','duration','what happens','كيف','سير','مده','يدوم','تجري'],
     a:function(l){ return lbl(l,
        'Une réunion dure environ <b>deux heures</b> : accueil, présentation du thème par le Toastmaster du jour, <b>discours préparés</b> de 5 à 7 minutes, <b>Table Topics</b> (improvisation de 1 à 2 minutes), <b>évaluations</b>, puis rapports du chronométreur et du grammairien, vote et prix.',
        'A meeting lasts about <b>two hours</b>: welcome, theme introduced by the Toastmaster of the day, <b>prepared speeches</b> of 5 to 7 minutes, <b>Table Topics</b> (1 to 2 minutes of impromptu speaking), <b>evaluations</b>, then timer and grammarian reports, voting and awards.',
        'يدوم اللقاء حوالي <b>ساعتين</b>: الاستقبال، تقديم الموضوع من طرف مسيّر اللقاء، <b>خطب مُعدّة</b> من 5 إلى 7 دقائق، <b>الارتجال</b> (دقيقة إلى دقيقتين)، <b>التقييمات</b>، ثم تقارير ضابط الوقت والنحوي، والتصويت والجوائز.')
        + acts(act(HOME+'#reunions',lbl(l,'Voir le déroulé','See the format','عرض سير اللقاء'))); }},
    {id:'roles', k:['role','roles','chronometreur','grammairien','compteur','toastmaster du jour','evaluateur','orateur','timer','grammarian','ah counter','speaker','evaluator','ادوار','دور','ضابط الوقت','النحوي','المقيم'],
     a:function(l){ return lbl(l,
        'Chaque réunion répartit des rôles : Toastmaster du jour (animateur), orateurs, évaluateurs, Table Topics Master, évaluateur général, chronométreur, grammairien et compteur de tics. Tenir un rôle, c\'est déjà progresser !',
        'Each meeting has roles: Toastmaster of the day (host), speakers, evaluators, Table Topics Master, general evaluator, timer, grammarian and ah-counter. Taking a role is already progress!',
        'لكل لقاء أدوار: مسيّر اللقاء، الخطباء، المقيّمون، مسيّر الارتجال، المقيّم العام، ضابط الوقت، النحوي، وعدّاد اللوازم. أداء دور هو في حد ذاته تقدّم!')
        + acts(act(HOME+'#reunions',lbl(l,'Les rôles en détail','Roles in detail','الأدوار بالتفصيل'))); }},
    {id:'tt', k:['table topic','table topics','improvisation','improviser','impromptu','ارتجال'],
     a:function(l){ return lbl(l,
        'Les <b>Table Topics</b>, c\'est l\'improvisation : on vous propose un sujet surprise et vous parlez 1 à 2 minutes. Parfait pour apprendre à penser vite et parler clair. Les invités peuvent essayer, sans obligation.',
        '<b>Table Topics</b> are impromptu speaking: you get a surprise topic and speak for 1 to 2 minutes. Perfect for learning to think fast and speak clearly. Guests may try, with no obligation.',
        '<b>الارتجال</b> (Table Topics): يُقترح عليك موضوع مفاجئ وتتحدّث لمدة دقيقة إلى دقيقتين. تمرين مثالي لتعلّم التفكير السريع والكلام الواضح، ويمكن للضيوف تجربته دون التزام.'); }},
    {id:'pathways', k:['pathways','parcours','niveaux','projet','programme educatif','formation','cursus','path','levels','project','education','مسار','باثوايز','مستويات','تكوين'],
     a:function(l){ return lbl(l,
        '<b>Pathways</b> est le programme éducatif de Toastmasters : des parcours en ligne organisés en <b>cinq niveaux</b> (Bases, Style, Compétences, Expertise, Maîtrise). Chaque projet se présente sous forme de discours en réunion et reçoit une évaluation.',
        '<b>Pathways</b> is the Toastmasters education programme: online learning paths organised in <b>five levels</b>. Each project is delivered as a speech at a meeting and receives an evaluation.',
        '<b>Pathways</b> هو البرنامج التعليمي لتوستماسترز: مسارات إلكترونية من <b>خمسة مستويات</b>، يُقدَّم كل مشروع فيها على شكل خطاب في اللقاء ويحظى بتقييم.')
        + acts(act(HOME+'#toastmasters',lbl(l,'En savoir plus','Learn more','اعرف المزيد'))); }},
    {id:'contact', k:['contact','contacter','telephone','whatsapp','appeler','numero','joindre','email','mail','ecrire','phone','call','number','reach','هاتف','واتساب','اتصال','رقم','تواصل','اتصل'],
     a:function(l){ return lbl(l,
        'Vous pouvez joindre le club par <b>WhatsApp ou téléphone au '+TEL+'</b>, ou via nos réseaux sociaux.',
        'You can reach the club by <b>WhatsApp or phone at '+TEL+'</b>, or through our social media.',
        'يمكنك التواصل مع النادي عبر <b>واتساب أو الهاتف على الرقم <span dir="ltr">'+TEL+'</span></b>، أو عبر شبكاتنا الاجتماعية.')
        + acts(btnWa(l), act('https://www.instagram.com/rabat_toastmasters_club/','Instagram',true), act('https://www.facebook.com/rabattoastmastersclub','Facebook',true)); }},
    {id:'bureau', k:['bureau','president','presidente','officier','equipe','responsable','=vp','tresorier','tresoriere','secretaire','qui dirige','board','officers','team','who runs','المكتب','الرئيس','رئيس','فريق','مسؤول'],
     a:function(l){ return lbl(l,
        'Le bureau 2026-2027 : <b>Mohammed Rachid Tazi</b> (Président), Mohamed Diallo (VP Éducation), Afaf Boulanouar (VP Adhésions), Mamady Bangoura (VP Relations publiques), Zaineb Bouali (Trésorière), Samir Belhajjam (Secrétaire), Oumaima Hajri (Sergent d\'armes) et Ali El Manja (Président sortant).',
        'The 2026-2027 board: <b>Mohammed Rachid Tazi</b> (President), Mohamed Diallo (VP Education), Afaf Boulanouar (VP Membership), Mamady Bangoura (VP Public Relations), Zaineb Bouali (Treasurer), Samir Belhajjam (Secretary), Oumaima Hajri (Sergeant at Arms) and Ali El Manja (Immediate Past President).',
        'مكتب 2026-2027: <b>محمد رشيد التازي</b> (الرئيس)، محمد ديالو (نائب الرئيس للتعليم)، عفاف بولنوار (نائبة الرئيس للعضوية)، مامادي بانغورا (نائب الرئيس للعلاقات العامة)، زينب بوعلي (أمينة المال)، سمير بلحجام (الكاتب)، أميمة حجري (ضابطة القاعة)، وعلي المنجة (الرئيس السابق).')
        + acts(act(HOME+'#bureau',lbl(l,'Voir le bureau','See the board','عرض المكتب'))); }},
    {id:'history', k:['histoire','historique','fonde','fondation','creation','cree','charte','depuis quand','2018','anciens presidents','history','founded','since when','chartered','past presidents','تاريخ','تاسيس','تاسس','منذ متي'],
     a:function(l){ return lbl(l,
        'Le Rabat Toastmasters Club a été officiellement reconnu le <b>19 août 2018</b> (club n° 05894368). Depuis, il a tenu plus de <b>300 réunions</b>, a vu se succéder neuf présidents et fait partie du District 107.',
        'The Rabat Toastmasters Club was officially chartered on <b>19 August 2018</b> (club no. 05894368). Since then it has held over <b>300 meetings</b>, had nine presidents, and belongs to District 107.',
        'تم الاعتراف رسمياً بنادي الرباط توستماسترز في <b>19 غشت 2018</b> (النادي رقم 05894368). ومنذ ذلك الحين عقد أكثر من <b>300 لقاء</b>، وتعاقب على رئاسته تسعة رؤساء، وهو جزء من المقاطعة 107.')
        + acts(act(HOME+'#presidents',lbl(l,'Nos présidents','Our presidents','رؤساؤنا'))); }},
    {id:'palmares', k:['concours','palmares','podium','trophee','gagne','champion','laureat','contest','competition','award','won','winner','مسابقه','جائزه','فوز','فاز'],
     a:function(l){ return lbl(l,
        'Nos membres défendent les couleurs du club dans les concours officiels, du club à l\'Area, à la Division et jusqu\'au District. En 2026, Mohamed Diallo a remporté la 1re place en français au concours de Division (Séville) et la 3e place au District 107 (Málaga).',
        'Our members represent the club in official contests, from club to Area, Division and District. In 2026 Mohamed Diallo won 1st place in French at the Division contest (Seville) and 3rd place at District 107 (Málaga).',
        'يمثّل أعضاؤنا النادي في المسابقات الرسمية، من النادي إلى المنطقة ثم القسم والمقاطعة. في 2026 فاز محمد ديالو بالمركز الأول بالفرنسية في مسابقة القسم (إشبيلية) وبالمركز الثالث في المقاطعة 107 (مالقة).')
        + acts(act(HOME+'#palmares',lbl(l,'Voir le palmarès','See the results','عرض النتائج'))); }},
    {id:'agenda', k:['programme','agenda','calendrier','planning','theme du mois','ce mois','mois','cycle','trimestre','programme','calendar','this month','schedule','plan','برنامج','جدول','رزنامه','اجنده','الشهر'],
     a:function(l){
      var n=nextSession(), extra='';
      if(n){ extra = lbl(l,' Ce mois-ci : '+n.c.icon+' <b>'+esc(n.c.title)+'</b>.',' This cycle: '+n.c.icon+' <b>'+esc(n.c.title)+'</b>.',' الدورة الحالية: '+n.c.icon+' <b>'+esc(n.c.title)+'</b>.'); }
      return lbl(l,
        'Chaque mois, un cycle de <b>trois réunions</b> autour d\'un même thème pour progresser pas à pas.'+extra,
        'Each month, a cycle of <b>three meetings</b> around one theme to progress step by step.'+extra,
        'كل شهر، دورة من <b>ثلاثة لقاءات</b> حول موضوع واحد للتقدّم خطوة بخطوة.'+extra)
        + acts(act(HOME+'#agenda',lbl(l,'Voir l\'agenda','See the agenda','عرض الأجندة'))) + chips(['next'],l); }},
    {id:'media', k:['photo','album','video','youtube','galerie','image','souvenir','pictures','gallery','watch','صور','صوره','فيديو','فيديوهات','البوم'],
     a:function(l){ return lbl(l,
        'Retrouvez les moments forts du club dans l\'album photo, et des discours de nos membres dans la section Vidéos.',
        'Find the club\'s highlights in the photo album, and speeches by our members in the Videos section.',
        'اكتشف أبرز لحظات النادي في ألبوم الصور، وخطب أعضائنا في قسم الفيديوهات.')
        + acts(act('album.html',lbl(l,'Album photo','Photo album','ألبوم الصور')), act(HOME+'#videos',lbl(l,'Vidéos','Videos','الفيديوهات'))); }},
    {id:'social', k:['instagram','facebook','linkedin','reseaux','reseau social','suivre','abonner','follow','social media','انستغرام','انستجرام','فيسبوك','لينكدين','تابع'],
     a:function(l){ return lbl(l,'Suivez le club sur les réseaux sociaux :','Follow the club on social media:','تابع النادي على الشبكات الاجتماعية:')
        + acts(act('https://www.instagram.com/rabat_toastmasters_club/','Instagram',true), act('https://www.facebook.com/rabattoastmastersclub','Facebook',true)); }},
    {id:'feedback', k:['avis','donner mon avis','feedback','commentaire','suggestion','review','opinion','راي','رايك','ملاحظه','اقتراح'],
     a:function(l){ return lbl(l,
        'Vous êtes déjà venu·e ? Merci ! Votre avis nous aide à progresser : il suffit d\'une minute.',
        'Already visited? Thank you! Your feedback helps us improve, and it only takes a minute.',
        'سبق أن حضرت؟ شكراً لك! رأيك يساعدنا على التحسّن، ولا يتطلّب سوى دقيقة.')
        + acts(act(AVIS,lbl(l,'👍 Donner mon avis','👍 Give feedback','👍 أعطِ رأيك'),true)); }},
    {id:'resources', k:['ressource','document','pdf','brochure','telecharger','guide','download','resources','موارد','وثائق','تحميل','دليل'],
     a:function(l){ return lbl(l,
        'La section Ressources propose des brochures à télécharger (100 raisons de rejoindre Toastmasters, All About Toastmasters…) et des liens utiles.',
        'The Resources section offers brochures to download (100 reasons to join Toastmasters, All About Toastmasters…) and useful links.',
        'يقدّم قسم الموارد كتيّبات للتحميل وروابط مفيدة.')
        + acts(act(HOME+'#ressources',lbl(l,'Ressources','Resources','الموارد'))); }},
    {id:'ramadan', k:['ramadan','رمضان'],
     a:function(l){ return lbl(l,
        'Pendant le Ramadan, la réunion du samedi a lieu à <b>12h00</b> au lieu de '+time(l)+'.',
        'During Ramadan, the Saturday meeting takes place at <b>12:00</b> instead of '+time(l)+'.',
        'خلال شهر رمضان، يُعقد لقاء السبت على الساعة <b>12:00</b> بدلاً من '+time(l)+'.'); }},
    {id:'online', k:['en ligne','zoom','distance','visio','teams','online','virtual','remote','عن بعد','اونلاين','افتراضي'],
     a:function(l){ return lbl(l,
        'Nos réunions ont lieu <b>en présentiel</b> à Rabat. Le club s\'est déjà réuni en ligne (notamment pendant la pandémie) : pour toute question sur une réunion en ligne, contactez le bureau.',
        'Our meetings are held <b>in person</b> in Rabat. The club has met online before (notably during the pandemic); for any question about online meetings, contact the board.',
        'تُعقد لقاءاتنا <b>حضورياً</b> بالرباط. سبق للنادي أن اجتمع عن بعد (خاصة خلال الجائحة)، ولأي سؤال حول اللقاءات عن بعد تواصل مع المكتب.')
        + acts(btnWa(l)); }},
    {id:'d107', k:['district','d107','area','division','=e3','espagne','portugal','مقاطعه','منطقه','قسم'],
     a:function(l){ return lbl(l,
        'Le club fait partie du <b>District 107</b> (Algérie, Andorre, Gibraltar, Maroc, Portugal, Espagne et Tunisie), Division E, Area E3. Le district organise des concours et formations en plusieurs langues.',
        'The club belongs to <b>District 107</b> (Algeria, Andorra, Gibraltar, Morocco, Portugal, Spain and Tunisia), Division E, Area E3. The district runs contests and training in several languages.',
        'ينتمي النادي إلى <b>المقاطعة 107</b> (الجزائر، أندورا، جبل طارق، المغرب، البرتغال، إسبانيا وتونس)، القسم E، المنطقة E3. تنظّم المقاطعة مسابقات وتكوينات بعدة لغات.'); }},
    {id:'bot', k:['qui es tu','tu es qui','robot','humain','=bot','chatbot','who are you','are you human','are you a bot','من انت','روبوت','انسان'],
     a:function(l){ return lbl(l,
        'Je suis l\'assistant automatique du site du club. Je réponds aux questions les plus fréquentes ; pour tout le reste, le bureau vous répond sur WhatsApp.',
        'I\'m the automatic assistant of the club\'s website. I answer the most common questions; for anything else, the board will answer you on WhatsApp.',
        'أنا المساعد الآلي لموقع النادي. أجيب عن الأسئلة الأكثر شيوعاً، ولأي سؤال آخر سيجيبك المكتب على واتساب.')
        + acts(btnWa(l)); }},
    {id:'greet', w:.6, k:['bonjour','salut','bonsoir','coucou','hello','=hi','=hey','good morning','salam','السلام','سلام','مرحبا','اهلا','صباح الخير','مساء الخير'],
     a:function(l){ return lbl(l,'Bonjour et bienvenue ! 😊 Que souhaitez-vous savoir sur le club ?','Hello and welcome! 😊 What would you like to know about the club?','أهلاً وسهلاً! 😊 ماذا تودّ أن تعرف عن النادي؟')
        + chips(['next','visit','where','cost'],l); }},
    {id:'thanks', w:.6, k:['merci','thanks','thank','super','parfait','genial','=top','great','perfect','شكرا','شكر','رائع','ممتاز'],
     a:function(l){ return lbl(l,'Avec plaisir ! Au plaisir de vous voir samedi 🎤','You\'re welcome! Hope to see you on Saturday 🎤','بكل سرور! نتمنى رؤيتك يوم السبت 🎤'); }}
  ];

  /* ---------- compréhension ---------- */
  function norm(s){
    return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
      .replace(/[ً-ٰٟـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
      .replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  }
  function tokens(t){
    var out=[];
    t.split(' ').forEach(function(w){
      if(!w) return; out.push(w);
      var m=w.match(/^(وال|بال|فال|كال|لل|ال|و|ب|ف|ل)(.{2,})$/);
      if(m){ out.push(m[2]); var m2=m[2].match(/^ال(.{2,})$/); if(m2) out.push(m2[1]); }
    });
    return out;
  }
  INTENTS.forEach(function(it){ it.kn = it.k.map(function(k){ var exact=k.charAt(0)==='='; return {x:exact, s:norm(exact?k.slice(1):k)}; }); });

  function understand(text){
    var t=norm(text), padded=' '+t+' ', tk=tokens(t), res=[];
    INTENTS.forEach(function(it){
      var sc=0;
      it.kn.forEach(function(k){
        if(!k.s) return;
        if(k.s.indexOf(' ')>=0){ if(padded.indexOf(' '+k.s)>=0) sc+=2; }
        else if(k.x){ if(tk.indexOf(k.s)>=0) sc+=1; }
        else if(tk.some(function(w){ return w.indexOf(k.s)===0; })) sc+= (k.s.length>=4?1:.8);
      });
      if(sc>0) res.push({it:it, raw:sc, sc:sc*(it.w||1)});
    });
    res.sort(function(a,b){ return b.sc-a.sc; });
    if(!res.length || res[0].raw<.8) return [];
    var picked=[res[0].it];
    var excl=res[0].it.no||[];
    for(var i=1;i<res.length && picked.length<2;i++){
      var r=res[i];
      if(excl.indexOf(r.it.id)>=0 || r.it.w) continue;
      if(r.sc>=Math.max(1,res[0].sc*.65)) picked.push(r.it);
    }
    return picked;
  }
  function detectLang(text){
    if(/[؀-ۿ]/.test(text)) return 'ar';
    var w=' '+norm(text)+' ';
    var en=(w.match(/ (the|is|are|what|when|where|how|do|does|can|i|you|meeting|free|much|who|join|have|to) /g)||[]).length;
    var fr=(w.match(/ (le|la|les|est|quand|ou|comment|je|vous|reunion|quel|quelle|des|une|un|combien|faut|il|on|c) /g)||[]).length;
    if(en>fr) return 'en'; if(fr>en) return 'fr'; return L();
  }
  function fallback(l){
    return lbl(l,
      'Je n\'ai pas encore la réponse à cette question 🤔. Le bureau vous répondra volontiers sur WhatsApp ('+TEL+'). Vous pouvez aussi essayer :',
      'I don\'t have the answer to that yet 🤔. The board will gladly answer you on WhatsApp ('+TEL+'). You can also try:',
      'ليس لدي جواب عن هذا السؤال بعد 🤔. سيجيبك المكتب بكل سرور على واتساب (<span dir="ltr">'+TEL+'</span>). يمكنك أيضاً تجربة:')
      + chips(['next','visit','where','cost','lang','format'],l) + acts(btnWa(l));
  }
  function welcome(l){
    return lbl(l,
      'Bonjour 👋 Je suis l\'assistant du <b>Rabat Toastmasters Club</b>. Posez-moi une question sur nos réunions, la visite en invité ou l\'adhésion. Vous préférez parler ? Appuyez sur le 🎤.',
      'Hello 👋 I\'m the <b>Rabat Toastmasters Club</b> assistant. Ask me about our meetings, visiting as a guest or membership. Prefer to talk? Tap the 🎤.',
      'مرحباً 👋 أنا مساعد <b>نادي الرباط توستماسترز</b>. اسألني عن لقاءاتنا أو الحضور كضيف أو الانخراط. تفضّل التحدّث؟ اضغط على 🎤.')
      + chips(['next','visit','where','cost','speak','tm'],l);
  }

  /* ---------- interface ---------- */
  var ICON_CHAT='<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="3"/></svg>';
  var ICON_X='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_MIC='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  var ICON_SEND='<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>';
  var ICON_RESET='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';

  var root=document.createElement('div'); root.className='cb'; root.id='cb';
  root.innerHTML=
    '<div class="cb-teaser" id="cb-teaser" hidden><span id="cb-teaser-t"></span><button type="button" class="cb-teaser-x" id="cb-teaser-x" aria-label="×">×</button></div>'+
    '<button type="button" class="cb-launch" id="cb-launch" aria-expanded="false" aria-controls="cb-panel"><span class="cb-ic-open">'+ICON_CHAT+'</span><span class="cb-ic-close">'+ICON_X+'</span><span class="cb-badge" id="cb-badge" hidden>1</span></button>'+
    '<div class="cb-panel" id="cb-panel" role="dialog" aria-labelledby="cb-title" hidden>'+
      '<div class="cb-head"><span class="cb-av">RTC</span><div class="cb-ht"><b id="cb-title"></b><small id="cb-sub"></small></div>'+
        '<button type="button" class="cb-hbtn" id="cb-reset">'+ICON_RESET+'</button><button type="button" class="cb-hbtn" id="cb-close">'+ICON_X+'</button></div>'+
      '<div class="cb-msgs" id="cb-msgs" aria-live="polite"></div>'+
      '<form class="cb-form" id="cb-form" autocomplete="off">'+
        '<button type="button" class="cb-mic" id="cb-mic">'+ICON_MIC+'</button>'+
        '<input class="cb-in" id="cb-in" type="text" maxlength="300">'+
        '<button type="submit" class="cb-send" id="cb-send">'+ICON_SEND+'</button>'+
      '</form>'+
    '</div>';
  document.body.appendChild(root);

  var $=function(id){ return document.getElementById(id); };
  var launch=$('cb-launch'), panel=$('cb-panel'), msgs=$('cb-msgs'), form=$('cb-form'), input=$('cb-in'), mic=$('cb-mic');
  var badge=$('cb-badge'), teaser=$('cb-teaser');

  var state={t:[], opened:false};
  try{ var s=JSON.parse(sessionStorage.getItem(STORE)||'null'); if(s&&typeof s==='object'){ state.t=Array.isArray(s.t)?s.t:[]; state.opened=!!s.opened; } }catch(e){}
  function persist(){ try{ sessionStorage.setItem(STORE, JSON.stringify(state)); }catch(e){} }

  function applyUI(){
    var u=UI[L()];
    $('cb-title').textContent=u.title; $('cb-sub').textContent=u.sub; input.placeholder=listening?u.micOn:u.ph;
    $('cb-teaser-t').textContent=u.teaser; launch.setAttribute('aria-label', panel.hidden?u.open:u.close);
    $('cb-close').setAttribute('aria-label',u.close); $('cb-close').title=u.close;
    $('cb-reset').setAttribute('aria-label',u.reset); $('cb-reset').title=u.reset;
    mic.setAttribute('aria-label',u.mic); mic.title=u.mic; $('cb-send').setAttribute('aria-label',u.send);
  }
  function add(role,html,save){
    var d=document.createElement('div'); d.className='cb-m cb-'+role; d.innerHTML=html; msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
    if(save!==false){ state.t.push({r:role,h:html}); if(state.t.length>60) state.t=state.t.slice(-60); persist(); }
    return d;
  }
  function render(){
    msgs.innerHTML='';
    if(!state.t.length){ state.t=[{r:'b',h:welcome(L()),w:1}]; persist(); }
    state.t.forEach(function(m){ add(m.r,m.h,false); });
  }
  function reply(html){
    var typing=add('b typing','<span></span><span></span><span></span>',false);
    setTimeout(function(){ typing.remove(); add('b',html); }, 450+Math.random()*350);
  }
  function answer(text, intentId){
    var l, list;
    if(intentId){ l=L(); list=INTENTS.filter(function(i){ return i.id===intentId; }); }
    else { l=detectLang(text); list=understand(text); }
    if(!list.length){ reply(fallback(l)); return; }
    reply(list.map(function(it){ return '<div class="cb-part">'+it.a(l)+'</div>'; }).join(''));
  }
  function ask(text,intentId){
    text=String(text||'').trim(); if(!text) return;
    add('u',esc(text));
    answer(text,intentId);
  }

  function stopAttract(){ launch.classList.remove('attract'); badge.hidden=true; teaser.hidden=true; }
  function openPanel(){
    panel.hidden=false; root.classList.add('open'); launch.setAttribute('aria-expanded','true');
    stopAttract(); if(!state.opened){ state.opened=true; persist(); }
    render(); applyUI();
    if(window.matchMedia('(min-width:700px)').matches) setTimeout(function(){ input.focus(); },50);
  }
  function closePanel(){ panel.hidden=true; root.classList.remove('open'); launch.setAttribute('aria-expanded','false'); stopMic(); applyUI(); }

  launch.addEventListener('click',function(){ panel.hidden?openPanel():closePanel(); });
  $('cb-close').addEventListener('click',closePanel);
  $('cb-reset').addEventListener('click',function(){ state.t=[]; persist(); render(); });
  $('cb-teaser-x').addEventListener('click',function(e){ e.stopPropagation(); stopAttract(); state.opened=true; persist(); });
  $('cb-teaser-t').addEventListener('click',openPanel);
  form.addEventListener('submit',function(e){ e.preventDefault(); var v=input.value; input.value=''; stopMic(true); ask(v); });
  msgs.addEventListener('click',function(e){
    var c=e.target.closest('.cb-chip'); if(c){ ask(c.textContent, c.getAttribute('data-intent')); return; }
    var a=e.target.closest('a.cb-act'); if(a && a.getAttribute('href').charAt(0)==='#' && window.matchMedia('(max-width:699px)').matches) closePanel();
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && !panel.hidden) closePanel(); });
  document.addEventListener('langchange',function(){
    applyUI();
    if(state.t.length===1 && state.t[0].w){ state.t=[]; if(!panel.hidden) render(); else persist(); }
  });

  /* ---------- dictée vocale (optionnelle) ---------- */
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition, rec=null, listening=false, heard='';
  if(!SR) mic.hidden=true;
  function stopMic(silent){ if(rec){ try{ silent?rec.abort():rec.stop(); }catch(e){} } }
  function micUI(on){ listening=on; mic.classList.toggle('on',on); mic.setAttribute('aria-pressed',on?'true':'false'); applyUI(); }
  mic.addEventListener('click',function(){
    if(listening){ stopMic(); return; }
    rec=new SR(); rec.lang={fr:'fr-FR',en:'en-US',ar:'ar-MA'}[L()]; rec.interimResults=true; rec.continuous=false; rec.maxAlternatives=1; heard='';
    rec.onresult=function(e){ var fin='',tmp=''; for(var i=0;i<e.results.length;i++){ var r=e.results[i]; if(r.isFinal) fin+=r[0].transcript; else tmp+=r[0].transcript; } heard=fin; input.value=(fin+tmp).trim(); };
    rec.onerror=function(e){ var u=UI[L()]; if(e.error==='not-allowed'||e.error==='service-not-allowed') add('b',esc(u.micDenied)); else if(e.error==='no-speech') add('b',esc(u.noSpeech)); };
    rec.onend=function(){ micUI(false); rec=null; var v=input.value.trim(); if(heard && v){ input.value=''; ask(v); } };
    try{ rec.start(); micUI(true); }catch(err){ micUI(false); }
  });

  /* ---------- attirer l'attention (une seule fois par session) ---------- */
  applyUI();
  if(!state.opened){
    launch.classList.add('attract');
    setTimeout(function(){ if(panel.hidden && !state.opened) badge.hidden=false; },4000);
    setTimeout(function(){ if(panel.hidden && !state.opened) teaser.hidden=false; },6500);
    setTimeout(function(){ teaser.hidden=true; },20000);
  }
})();
