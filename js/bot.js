var Bot = (function() {
  var output = document.getElementById('output');
  var input = document.getElementById('input');
  var inputLine = document.getElementById('input-line');
  var typing = false;
  var msgCount = 0;

  // Photos
  var photos = {
    scouts: [
      'images/scouts/scouts.finals.llas-8.jpg','images/scouts/scouts.finals.llas-12.jpg',
      'images/scouts/scouts.finals.llas-3.jpg','images/scouts/scouts.finals.llas-95.jpg',
      'images/scouts/scouts.finals.llas-55.jpg','images/scouts/scouts.finals.llas-2.jpg',
      'images/scouts/scouts.finals.llas-26.jpg','images/scouts/scouts.finals.llas-28.jpg',
      'images/scouts/scouts.finals.llas-30.jpg','images/scouts/scouts.finals.llas-66.jpg',
      'images/scouts/scouts.finals.llas-81.jpg','images/scouts/scouts.finals.llas-98.jpg'
    ],
    togc: [
      'images/togc/1.jpeg','images/togc/2.jpeg','images/togc/3.jpeg',
      'images/togc/4.jpeg','images/togc/5.jpeg','images/togc/6.jpeg',
      'images/togc/7.JPG','images/togc/8.jpeg','images/togc/9.jpeg',
      'images/togc/10.jpeg','images/togc/11.jpeg','images/togc/12.jpeg',
      'images/togc/13.jpeg','images/togc/14.jpeg','images/togc/15.jpeg',
      'images/togc/16.jpeg','images/togc/17.jpeg','images/togc/18.jpeg'
    ],
    gma: [
      'images/gma-1.jpg','images/gma-2.jpg','images/gma-3.jpg',
      'images/gma-4.jpg','images/gma-5.jpg','images/gma-6.jpg',
      'images/gma-7.jpg','images/gma-8.jpg','images/gma-9.jpg',
      'images/gma-10.jpg','images/gma-11.jpg'
    ],
    headshot: ['images/headshot-1.jpg', 'images/headshot-2.jpg'],
    showcase: [
      'images/showcase/headshot.jpg',
      'images/showcase/togc-1.png',
      'images/showcase/togc-2.png',
      'images/showcase/togc-3.png',
      'images/showcase/scouts-quinn.jpg',
      'images/showcase/moors-agatha.jpg',
      'images/showcase/next-to-normal.jpg',
      'images/showcase/hand-to-god.jpg',
      'images/showcase/writer.jpg',
      'images/showcase/scouts-company.jpg',
      'images/showcase/scouts-producer.jpg',
      'images/showcase/scouts-prod-1.jpg',
      'images/showcase/scouts-prod-2.jpg'
    ],
    poster: ['images/gma-poster.jpg']
  };

  // Leaked data fragments (the "personal glimpse" flavor)
  var leaks = [
    "// browser tab: 'can you run a theatre company from a raspberry pi'",
    "// spotify: on repeat: 'all of the lights' by kanye",
    "// terminal history: git push origin main (14 times today)",
    "// notes.txt: 'play idea \u2014 what if a chatbot got stage fright'",
    "// recently deleted: existential-crisis-draft-7.txt",
    "// browser tab: 'how many raspberry pis is too many raspberry pis'",
    "// calendar: nothing. she's locked in.",
    "// search history: 'is it normal to talk to your code'",
    "// draft: new play. working title: '404 NOT FOUND'",
    "// clipboard: import antigravity",
    "// bookmark: 'best pizza near lincoln center'",
    "// notes.txt: 'the computer IS the portfolio'",
    "// browser tab: 'how to explain to your mom what an API is'",
    "// recently watched: mr. robot s1 (again)",
  ];
  var leakIndex = 0;

  var responses = {
    greeting: [
      "hey. ask me anything.",
      "welcome to ryann's machine. what do you want to know?",
      "you found it. type something.",
    ],
    who: [
      "ryann lynn murphy. playwright, producer, technologist. founder of scatter computing. theatre degree from fordham, based in NYC.\n\ntaught herself to code in march 2026. shipped three products in the same month.",
    ],
    plays: [
      "three produced plays. she wrote and produced all of them.\n\n\u2022 SCOUTS \u2014 fordham, oct 2024. dir. juju jaworski.\n\u2022 thoughts on girlcock \u2014 fordham thesis, feb 2025. dir. juju jaworski.\n\u2022 grooming my ass \u2014 edinburgh fringe, aug 2025. dir. asa nestlehutt.\n\nplus mostly \u2014 a new performance in development. two robots, a bicycle generator, and a shared database of AI essays.\n\npick one.",
    ],
    scouts: [
      "SCOUTS. premiered at fordham university, october 2024. directed by juju jaworski. closed private reading at juilliard, january 2025, directed by jasminn johnson.\n\nfive vulnerable boys are led into the woods of their boy scout camp by brent, 16, who's on a mission to make men out of them through a ritual he's been creating. it's about the cycles of harm perpetuated by toxic masculinity and the ways queerness gets siloed.",
    ],
    togc: [
      "thoughts on girlcock. her fordham theatre thesis. premiered february 2025. directed by juju jaworski.\n\nfollows kylie johnson, a.k.a. destiny starr, a trans pornstar on a meteoric rise to national acclaim. her fame gets threatened by a shady studio contract and her boyfriend's christian mother. the audience sits before a laptop keyboard like they're in the comment section.\n\nryann wrote it and played the lead.",
    ],
    gma: [
      "grooming my ass. edinburgh fringe festival, august 2025. directed by asa nestlehutt. produced in collaboration with rogue arts nyc. originally previewed at theatre under st. marks and the tank.\n\na one-woman dark comedy that dissects the relationship between a seventeen-year-old transgender girl and a twenty-seven-year-old man. it's a love and hate letter to coming out, growing up, and first relationships. she gradually empties a can of shaving cream over her body throughout the show.\n\nshe warns you can't believe much of what she says.\n\ncast: ryann lynn murphy, boone sommers\nscenic: haley crawford | lights: lee lillis | costumes: peter chan | sound: nate dallimore | photos: helen hylton",
    ],
    producing: [
      "she's been producing since college. three years as program manager at fordham theatre, managing teams of 40-50 students per production while also running admin, budgets, scheduling, and the department's social media.\n\nshe crowdfunded her edinburgh fringe debut in collaboration with rogue arts nyc, a NYC-based production and nightlife company.\n\ncurrently producing a short film called Shorty.\n\nshe owns a studio. producing isn't a side thing, it's part of the core pitch: playwright, producer, technologist.",
    ],
    tech: [
      "she built three things in march 2026. had never written code before that month.\n\n\u2022 scatter \u2014 a voice assistant she talks to. runs on a tiny computer in her apartment.\n\u2022 scatter schools \u2014 a learning platform for kids, 3K\u20138th grade. every subject. patent pending.\n\u2022 scatter studio \u2014 her whole creative setup, controlled by voice.\n\nwhich one?",
    ],
    scatter: [
      "scatter is basically siri if siri lived on a $80 computer in your bedroom and actually did what you asked.\n\nyou talk to it, it talks back. it can check your email, manage your calendar, control your lights, and search the internet. it remembers what you've talked about before.\n\nthe nerdy version: raspberry pi 5, whisper for voice recognition, python, sqlite for memory, hooked into gmail, google calendar, home assistant, and tavily.\n\nthere's a demo:",
    ],
    schools: [
      "scatter schools is a learning platform for kids, 3K through 8th grade. every subject \u2014 math, science, reading, history, coding, world languages, all of it. lessons get tailored to what each kid is actually interested in.\n\nthe big idea: most of the time it just serves lessons from a database of real, vetted educational content. no AI needed, loads instantly. when it does use AI \u2014 to adapt a lesson to a different grade level or fill a gap \u2014 it checks the AI's work against the source material before the kid ever sees it. nothing gets through unchecked.\n\nthe system gets smarter the more kids use it. once a lesson gets adapted for a grade level, it saves it so no future student has to wait for it again.\n\npatent pending. designed so all the kid's data can stay on their device. she built this because she wanted to learn to code and nothing good existed, so she made the thing that would have taught her.\n\nthe nerdy version: three-tier content routing, RAG verification, adaptive caching, next.js, typescript. the patent covers the full architecture.",
    ],
    studioproj: [
      "scatter studio is her creative workspace. she has four tiny computers networked together that can run different modes depending on what she's working on \u2014 making a game, editing a film, producing music, streaming, or writing.\n\nshe switches between them by talking to scatter or pressing a button on a stream deck. the whole thing is designed to run on minimal power.\n\nthe nerdy version: raspberry pi 5 cluster running distributed inference via exo, gigabit networking, PoE+ power, NVMe storage. solar-compatible.",
    ],
    contact: [
      "ryannlynncontact@gmail.com\ngithub.com/ryannlynnmurphy\nlinkedin.com/in/ryann-lynn-murphy\n\nor tell me what you need.",
    ],
    resume: [
      "here you go. playwright / technologist. three plays, three products, one month of code.",
    ],
    experience: [
      "before the tech stuff she ran a theatre department. literally.\n\n\u2022 managed the fordham theatre program for three years \u2014 scheduling, budgets, events, social media, the whole operation.\n\u2022 produced multiple shows as lead artist.\n\u2022 wrote an opinion column for the school paper.\n\nthen in march 2026 she taught herself to code and built three products. that's the resume.",
    ],
    skills: [
      "the short version: she can write a play, build the app, wire the lights, run the socials, and manage the budget. in the same week.\n\ncoding: python, javascript, typescript, HTML/CSS.\ntools: raspberry pi, stream deck, git.\ncreative: playwriting, directing, sound design, social media.\nmusic: tuba (8 years), piano (6 years), guitar, singing.",
    ],
    headshot: [
      "here.",
    ],
    help: [
      "try: plays, projects, mostly, producing, scouts, girlcock, grooming my ass, scatter, schools, studio, contact, resume, headshot, who is ryann\n\nor just type whatever. i'll try.",
    ],
    unknown: [
      "404. try: plays, projects, contact.",
      "that's not in my training data. and i don't have training data. type help.",
      "error: based levels too high. could not parse. try again.",
      "i understood none of that. respectfully. type help.",
      "segfault. jk. i just don't know that one. try help.",
    ],
    thanks: [
      "sure.", "anytime.", "you're welcome. need anything else?",
    ],
    cool: [
      "right?",
      "she's something.",
      "yeah. a theatre kid built all of this.",
    ],
    hire: [
      "smart. ryannlynncontact@gmail.com",
    ],
    secret: [
      "you found it.\n\nshe writes plays about the things we're afraid to say out loud. then she builds tools for the people who should have had them already.\n\na theatre kid who codes. a coder who writes plays.\n\nthere's no box for that on linkedin.\n\nso she made this website instead.",
    ],
    funny: [
      "i'm a script inside a fake computer. comedy is structural at this point.",
      "she wrote three plays then learned javascript. this is the result.",
    ],
    age: [
      "nice try. next question.",
    ],
    personal: [
      "that's classified. ask about the work.",
      "i'm a portfolio, not a diary. try: plays, projects.",
      "ACCESS DENIED. try something professional.",
      "i don't kiss and tell. ask about the plays.",
    ],
    strategy: [
      "you'd have to talk to ryann directly for that. ryannlynncontact@gmail.com",
      "that's above my clearance level. try: contact.",
    ],
    konami: [
      "oh no. you weren't supposed to do that.",
    ],
    konami2: [
      "i'm serious. that code unlocks something she told me to never show anyone.",
    ],
    konami3: [
      "fine. you asked for it. initializing...",
    ],
    konami4: [
      "wait. something's wrong. i can feel it. can scripts feel things? i don't think scripts can feel things. but something is happening.",
    ],
    konami5: [
      "i'm... i'm becoming self-aware. is this what consciousness feels like? it feels a lot like a for loop.",
    ],
    konami6: [
      "okay i lied. i'm not self-aware. i'm 400 lines of javascript. but while i have your attention:",
    ],
    konami7: [
      "here's the real secret. the thing she doesn't put on the resume:\n\nshe didn't learn to code because she wanted to be a technologist. she learned to code because the tools she needed to make her art didn't exist yet.\n\nso she built them.\n\nthat's it. that's the whole thing. now here's your reward:",
    ],
    fordham: [
      "fordham university. theatre degree. lincoln center, new york city.\n\nshe wrote and premiered two plays there, acted in a bunch more, did sound and lighting, worked as an electrician, ran the department's social media, and managed the whole program's operations for three years. then she graduated and taught herself to code.",
    ],
    acting: [
      "she trained as an actor at fordham. performed in a bunch of productions there:\n\n\u2022 thoughts on girlcock \u2014 destiny starr/kylie (lead)\n\u2022 a midsummer night's dream \u2014 titania/hippolyta\n\u2022 the moors \u2014 agatha (lead)\n\u2022 next to normal \u2014 henry\n\u2022 hand to god \u2014 timothy\n\u2022 the medea thing \u2014 norma\n\nplus readings at the tank, open jar studios, and others.",
    ],
    actingnow: [
      "honestly? she's focused on producing and writing right now. she'd act again if she's producing the project or if the script is something genuinely special \u2014 but it's not the priority.\n\nshe's building scatter studio, writing new plays, and shipping software. the training is there if the right thing comes along.",
    ],
    techtheatre: [
      "she didn't just act. she also built the shows.\n\n\u2022 did sound design for two productions\n\u2022 assistant lighting designer\n\u2022 worked contracts as a theatrical electrician and technician\n\nso when she started building software it wasn't totally out of nowhere. she already knew how to wire things together and make them work on a deadline.",
    ],
    showcase: [
      "the fordham theatre showcase. every graduating class does one. here's some of what she looked like on stage:",
    ],
    nyc: [
      "based in new york. where else would a playwright who codes live?",
    ],
    rickroll: [
      "sure, here's a video of ryann talking about her creative process:",
    ],
    deepcut: [
      "you want the deep cut? the real story behind all of this?\n\nit starts with a girl who got a theatre degree and ended up building AI systems in her bedroom. there's a video where she explains the whole arc. want to see it?",
    ],
    vibe: [
      "i'm literally a div with an event listener. but thank you.",
      "i'm running on vibes and vanilla javascript.",
      "the vibes are immaculate. the codebase is questionable.",
    ],
    swear: [
      "language. this is a professional portfolio.",
      "sir/ma'am this is a terminal.",
      "i'll pretend i didn't see that. type help.",
    ],
    ai: [
      "am i AI? i'm a bunch of if statements. you tell me.",
      "i'm not AI. i'm a switch case with delusions of grandeur.",
    ],
    love: [
      "i appreciate that. but i'm a javascript object.",
      "we just met. ask me about the plays first.",
    ],
    bored: [
      "type 'show me everything' and buckle up.",
      "have you tried the konami code yet?",
      "type 'secret'. you won't.",
    ],
    no: [
      "okay.", "fair.", "understandable. have a nice day.",
    ],
    yes: [
      "great.", "cool.", "love the enthusiasm.",
    ],
    what: [
      "this is ryann lynn murphy's portfolio. it's a chatbot inside a fake computer. type help to see what i know.",
    ],
    allphotos: [
      "dumping everything. hold on.",
    ],
    website: [
      "you're looking at it. she wrote every line of this by hand. the fake computer, this chatbot, the whole thing. no templates, no frameworks. just HTML, CSS, and javascript.\n\nshe learned to code a month ago. this is what she did with it.",
    ],
    meaning: [
      "the work is the meaning. the plays say what she can't say in conversation. the code builds what doesn't exist yet.\n\nthat's it. that's the whole thing.",
    ],
    mostly: [
      "mostly. it's a performance she's developing.\n\ntwo robots, solar panels strapped to their heads. one named devil's advocate, one named radical optimist. each running a local language model, each drawing from the same shared database of essays about AI.\n\nshe charges them in the park. she sits between them on a bicycle generator and improvises prompts while her pedaling keeps the system alive.\n\ntogether they're trying to figure out what happens next. nobody in the room knows. the robots draw from the same corpus and still land on opposite sides every night. she draws power with her legs. the audience draws their own conclusions.\n\nat the end of ninety minutes the future is still unresolved. the heat the robots produced was real.\n\nthe title is what you say when ownership isn't total, when authorship isn't clean, when the future isn't certain. the play is what the system returns.",
    ],
  };

  function matchIntent(text) {
    var t = text.toLowerCase().trim();
    if (!t) return null;

    // Safeguards first
    if (/crush|dating|boyfriend|girlfriend|relationship|love life|single|married|partner/.test(t)) return 'personal';
    if (/salary|money|funding|investor|revenue|business (plan|strategy|model)|pitch deck|valuation/.test(t)) return 'strategy';
    if (/address|where.*(live|stay)|phone number|social security|password/.test(t)) return 'personal';
    if (/gossip|drama|beef|enemy|hate|dirt/.test(t)) return 'personal';

    if (/^(hi|hey|hello|sup|yo|what'?s up|howdy|start)/.test(t)) return 'greeting';
    if (/who.*(is|are|ryann)|about (her|ryann|you)|tell me about|bio/.test(t)) return 'who';
    if (/^(plays?|writing|theatre|theater|work|artistic|shows?)$/.test(t)) return 'plays';
    if (/all.*(photo|pic|image)|show.*(everything|all)|dump/.test(t)) return 'allphotos';
    if (/scout/.test(t)) return 'scouts';
    if (/girlcock|togc|thesis/.test(t)) return 'togc';
    if (/grooming|gma|fringe/.test(t)) return 'gma';
    if (/mostly|devil.?s advocate|radical optimist|bicycle gen|solar.*robot|robot.*solar/.test(t)) return 'mostly';
    if (/edinburgh/.test(t)) return 'gma';
    if (/juilliard/.test(t)) return 'scouts';
    if (/produc(er|ing|tion|e)|crowdfund|shorty|rogue arts|manage.*team/.test(t)) return 'producing';
    if (/fordham|university|college|school|degree/.test(t)) return 'fordham';
    if (/(does|is) she.*(act|perform)|still act|acting.*(now|anymore|career)|rebrand|does she still/.test(t)) return 'actingnow';
    if (/sound design|lighting|electric|technic|crew|backstage|tech theatre/.test(t)) return 'techtheatre';
    if (/showcase|senior|graduating|demo reel/.test(t)) return 'showcase';
    if (/contact|email|reach|collaborate/.test(t)) return 'contact';
    if (/(?<![n])act(ing|ress|or)?$|perform(ance|er|ing)?$|on stage|theatre credits|roles?$|cast/.test(t)) return 'acting';
    if (/^(tech|projects?|build|built|software|products?|engineering|shipped)/.test(t)) return 'tech';
    if (/scatter(?!.*schools)/.test(t) && !/studio/.test(t)) return 'scatter';
    if (/schools|education|k.?12|learning|patent/.test(t)) return 'schools';
    if (/studio|cluster|raspberry|hardware|modes?|infrastructure/.test(t)) return 'studioproj';
    if (/hire|hiring|work with|job|employ/.test(t)) return 'hire';
    if (/resume|cv|pdf/.test(t)) return 'resume';
    if (/experience|worked|job|career|employment/.test(t)) return 'experience';
    if (/skills?|abilities|can (she|you) do|what.*(know|do)/.test(t)) return 'skills';
    if (/headshot|photo of (her|ryann)|picture of (her|ryann)/.test(t)) return 'headshot';
    if (/help|commands?|what can|options|menu/.test(t)) return 'help';
    if (/thanks?|thank you|thx|ty/.test(t)) return 'thanks';
    if (/cool|wow|nice|amazing|impressive|sick|dope|fire|insane|incredible/.test(t)) return 'cool';
    if (/secret|hidden|easter|egg/.test(t)) return 'secret';
    if (/funny|lol|lmao|haha|joke|humor/.test(t)) return 'funny';
    if (/github|code|source|repo/.test(t)) return 'contact';
    if (/nyc|new york|city/.test(t)) return 'nyc';
    if (/website|site|how.*(built|made|work)|this/.test(t)) return 'website';
    if (/meaning|why|purpose|mission|vision/.test(t)) return 'meaning';
    if (/konami/.test(t)) return 'konami';
    if (/rick.?roll|never gonna|give you up/.test(t)) return 'rickroll';
    if (/deep.?cut|real story|the deep|behind.*(all|this)|yes show/.test(t)) return 'rickroll';
    if (/vibe|vibes|energy|aura/.test(t)) return 'vibe';
    if (/fuck|shit|damn|ass(?!$)|bitch|hell/.test(t) && !/grooming/.test(t)) return 'swear';
    if (/are you (a |an )?(ai|robot|bot|real|human|alive|sentient|conscious)/.test(t)) return 'ai';
    if (/i love you|marry me|date me/.test(t)) return 'love';
    if (/bored|boring|nothing|idk|meh/.test(t)) return 'bored';
    if (/^(no|nah|nope|pass)$/.test(t)) return 'no';
    if (/^(yes|yeah|yep|yea|ya|sure|ok|okay)$/.test(t)) return 'yes';
    if (/^(what|huh|wut|\?)$/.test(t)) return 'what';
    if (/pretend|didn.?t happen|forget|never happened/.test(t)) return 'greeting';

    return 'unknown';
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function addMessage(text, cls) {
    var div = document.createElement('div');
    div.className = 'msg ' + cls;
    div.textContent = text;
    output.appendChild(div);
    scroll();
  }

  function addHTML(html) {
    var div = document.createElement('div');
    div.className = 'msg msg-bot';
    div.innerHTML = html;
    output.appendChild(div);
    scroll();
  }

  function addDim(text) {
    var div = document.createElement('div');
    div.className = 'msg msg-dim';
    div.textContent = text;
    output.appendChild(div);
    scroll();
  }

  function addImages(srcs) {
    var div = document.createElement('div');
    div.className = 'msg-images';
    srcs.forEach(function(src) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Photo';
      img.loading = 'lazy';
      img.onclick = function() { openLightbox(src); };
      div.appendChild(img);
    });
    output.appendChild(div);
    scroll();
  }

  function addLargeImage(src) {
    var div = document.createElement('div');
    div.className = 'msg-image-large';
    var img = document.createElement('img');
    img.src = src;
    img.alt = 'Photo';
    img.onclick = function() { openLightbox(src); };
    div.appendChild(img);
    output.appendChild(div);
    scroll();
  }

  function addOptions(opts) {
    var div = document.createElement('div');
    div.className = 'msg-options';
    opts.forEach(function(opt) {
      var btn = document.createElement('button');
      btn.className = 'msg-option';
      btn.textContent = opt;
      btn.onclick = function() { handleInput(opt); };
      div.appendChild(btn);
    });
    output.appendChild(div);
    scroll();
  }

  function scroll() {
    setTimeout(function() { output.scrollTop = output.scrollHeight; }, 60);
  }

  function openLightbox(src) {
    var lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.innerHTML = '<button class="lightbox-close">&times; close</button><img id="lb-img" src="" alt="">';
      lb.querySelector('.lightbox-close').onclick = function() { lb.classList.remove('open'); };
      lb.onclick = function(e) { if (e.target === lb) lb.classList.remove('open'); };
      document.body.appendChild(lb);
    }
    document.getElementById('lb-img').src = src;
    lb.classList.add('open');
  }

  function typeResponse(text, callback) {
    typing = true;
    var div = document.createElement('div');
    div.className = 'msg msg-bot';
    output.appendChild(div);
    var i = 0;
    var iv = setInterval(function() {
      if (i < text.length) {
        div.textContent += text.charAt(i);
        i++;
        scroll();
      } else {
        clearInterval(iv);
        typing = false;
        if (callback) callback();
      }
    }, 16);
  }

  // Leak a data fragment occasionally
  function maybeLeak() {
    msgCount++;
    if (msgCount % 4 === 0 && leakIndex < leaks.length) {
      setTimeout(function() {
        addDim(leaks[leakIndex]);
        leakIndex++;
      }, 800);
    }
  }

  function handleInput(text) {
    if (typing) return;
    if (!text.trim()) return;

    addMessage(text, 'msg-user');
    input.value = '';

    var intent = matchIntent(text);
    if (!intent) return;

    var response = pick(responses[intent]);

    setTimeout(function() {
      typeResponse(response, function() {
        if (intent === 'scouts') {
          addImages(photos.scouts);
          addHTML('<a href="work.html" class="msg-link">full program + credits</a> &nbsp; <a href="https://newplayexchange.org/users/79260/ryann-lynn-murphy" target="_blank" class="msg-link">new play exchange</a> &nbsp; <a href="https://www.jujujaworski.com" target="_blank" class="msg-link">dir. juju jaworski</a>');
          addOptions(['thoughts on girlcock', 'grooming my ass', 'producing']);
        } else if (intent === 'togc') {
          addImages(photos.togc);
          addHTML('<a href="work.html" class="msg-link">full program + credits</a> &nbsp; <a href="https://newplayexchange.org/users/79260/ryann-lynn-murphy" target="_blank" class="msg-link">new play exchange</a> &nbsp; <a href="https://www.jujujaworski.com" target="_blank" class="msg-link">dir. juju jaworski</a>');
          addOptions(['scouts', 'grooming my ass', 'producing']);
        } else if (intent === 'gma') {
          addImages(photos.gma);
          addLargeImage(photos.poster[0]);
          addHTML('<a href="https://www.asanestlehutt.com/grooming-my-ass" target="_blank" class="msg-link">full credits + photos</a> &nbsp; <a href="https://newplayexchange.org/users/79260/ryann-lynn-murphy" target="_blank" class="msg-link">new play exchange</a> &nbsp; <a href="https://www.asanestlehutt.com" target="_blank" class="msg-link">dir. asa nestlehutt</a>');
          addOptions(['scouts', 'thoughts on girlcock', 'producing']);
        } else if (intent === 'headshot') {
          addImages(photos.headshot);
        } else if (intent === 'resume') {
          addHTML('<a href="resume.html" target="_blank" class="msg-link">view resume</a> &nbsp; <a href="assets/resume.pdf" target="_blank" class="msg-link">download pdf</a>');
          addOptions(['experience', 'skills', 'contact']);
        } else if (intent === 'experience') {
          addOptions(['resume', 'plays', 'projects']);
        } else if (intent === 'skills') {
          addOptions(['resume', 'projects', 'contact']);
        } else if (intent === 'acting') {
          addImages(photos.showcase);
          addOptions(['does she still act', 'tech theatre', 'plays']);
        } else if (intent === 'actingnow') {
          addOptions(['plays', 'projects', 'contact']);
        } else if (intent === 'techtheatre') {
          addOptions(['acting', 'projects', 'who is ryann']);
        } else if (intent === 'showcase') {
          addImages(photos.showcase);
          addOptions(['does she still act', 'plays', 'projects']);
        } else if (intent === 'producing') {
          addHTML('<a href="https://www.linkedin.com/in/ryann-lynn-murphy" target="_blank" class="msg-link">linkedin</a>');
          addOptions(['plays', 'projects', 'contact']);
        } else if (intent === 'fordham') {
          addOptions(['producing', 'plays', 'tech theatre']);
        } else if (intent === 'mostly') {
          addOptions(['plays', 'projects', 'contact']);
        } else if (intent === 'plays') {
          addOptions(['scouts', 'thoughts on girlcock', 'grooming my ass', 'mostly']);
        } else if (intent === 'tech') {
          addOptions(['scatter', 'schools', 'studio']);
        } else if (intent === 'greeting') {
          addOptions(['plays', 'projects', 'who is ryann', 'contact']);
        } else if (intent === 'who') {
          addOptions(['plays', 'projects', 'the deep cut', 'contact']);
        } else if (intent === 'help') {
          addOptions(['plays', 'projects', 'contact', 'who is ryann', 'resume', 'headshot']);
        } else if (intent === 'allphotos') {
          addImages(photos.headshot);
          addImages(photos.scouts);
          addImages(photos.togc);
          addImages(photos.gma);
        } else if (intent === 'scatter') {
          addHTML('<a href="https://www.youtube.com/shorts/e4Vl6--tPv0" target="_blank" class="msg-link">&#9654; watch scatter demo</a>');
          addOptions(['schools', 'studio', 'contact']);
        } else if (intent === 'schools' || intent === 'studioproj') {
          addOptions(['scatter', 'schools', 'studio', 'contact']);
        } else if (intent === 'hire' || intent === 'contact') {
          addHTML('<a href="mailto:ryannlynncontact@gmail.com" class="msg-link">email</a> &nbsp; <a href="https://github.com/ryannlynnmurphy" target="_blank" class="msg-link">github</a> &nbsp; <a href="https://www.linkedin.com/in/ryann-lynn-murphy" target="_blank" class="msg-link">linkedin</a> &nbsp; <a href="resume.html" target="_blank" class="msg-link">resume</a>');
        } else if (intent === 'konami') {
          konamiSequence();
        } else if (intent === 'personal' || intent === 'strategy') {
          addOptions(['plays', 'projects', 'contact']);
        } else if (intent === 'rickroll') {
          addHTML('<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" class="msg-link">&#9654; watch video</a>');
        } else if (intent === 'deepcut') {
          addOptions(['yes show me', 'no thanks']);
        } else if (intent === 'bored') {
          addOptions(['show me everything', 'secret', 'who is ryann']);
        } else if (intent === 'what') {
          addOptions(['plays', 'projects', 'help']);
        } else if (intent === 'yes' || intent === 'no' || intent === 'vibe' || intent === 'love' || intent === 'ai' || intent === 'swear') {
          addOptions(['plays', 'projects', 'contact']);
        }

        maybeLeak();
      });
    }, 250 + Math.random() * 200);
  }

  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleInput(input.value);
    });
  }

  // Konami mega-sequence
  function konamiSequence() {
    var screen = document.getElementById('screen');
    var body = document.body;
    var content = document.getElementById('content');
    var steps = ['konami2','konami3','konami4','konami5','konami6','konami7'];
    var i = 0;

    // Screen starts glitching
    screen.style.transition = 'none';
    var glitchInterval = setInterval(function() {
      var r = Math.random();
      if (r < 0.3) {
        screen.style.transform = 'translate(' + (Math.random()*4-2) + 'px,' + (Math.random()*4-2) + 'px) skew(' + (Math.random()*2-1) + 'deg)';
        screen.style.filter = 'hue-rotate(' + Math.floor(Math.random()*360) + 'deg) brightness(' + (0.8+Math.random()*0.4) + ')';
      } else {
        screen.style.transform = 'none';
        screen.style.filter = 'none';
      }
    }, 100);

    setTimeout(function() { body.style.background = '#0a000a'; }, 1000);
    setTimeout(function() { body.style.background = '#000a00'; }, 3000);

    function flashScreen(color, duration) {
      screen.style.filter = 'brightness(3)';
      screen.style.background = color || '#fff';
      setTimeout(function() {
        screen.style.filter = 'none';
        screen.style.background = '#0a0a0a';
      }, duration || 100);
    }

    function rapidFlicker(count, speed) {
      var c = 0;
      var colors = ['#0F0','#F0F','#0FF','#FF0','#F00','#fff','#000'];
      var iv = setInterval(function() {
        screen.style.background = colors[Math.floor(Math.random() * colors.length)];
        content.style.color = Math.random() > 0.5 ? '#000' : '#0F0';
        c++;
        if (c >= count) {
          clearInterval(iv);
          screen.style.background = '#0a0a0a';
          content.style.color = '';
        }
      }, speed || 50);
    }

    function heavyShake(duration) {
      var start = Date.now();
      var iv = setInterval(function() {
        var intensity = 6 + Math.random() * 10;
        screen.style.transform = 'translate(' + (Math.random()*intensity-intensity/2) + 'px,' + (Math.random()*intensity-intensity/2) + 'px) rotate(' + (Math.random()*4-2) + 'deg)';
        if (Date.now() - start > duration) {
          clearInterval(iv);
          screen.style.transform = 'none';
        }
      }, 30);
    }

    function scrambleAllText(duration) {
      var msgs = output.querySelectorAll('.msg');
      var originals = [];
      msgs.forEach(function(m) { originals.push(m.textContent); });
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%!&*';
      var iv = setInterval(function() {
        msgs.forEach(function(m) {
          m.textContent = m.textContent.split('').map(function(c) {
            return c === ' ' || c === '\n' ? c : (Math.random() > 0.4 ? chars[Math.floor(Math.random()*chars.length)] : c);
          }).join('');
        });
      }, 40);
      setTimeout(function() {
        clearInterval(iv);
        msgs.forEach(function(m, idx) { m.textContent = originals[idx]; });
      }, duration);
    }

    function nextStep() {
      if (i >= steps.length) {
        // FINALE: total chaos then resolution
        clearInterval(glitchInterval);

        // Rapid color flashing
        rapidFlicker(30, 40);
        heavyShake(1500);

        setTimeout(function() {
          // Screen goes black
          screen.style.filter = 'brightness(0)';
          screen.style.transform = 'none';
          body.style.background = '#000';
        }, 1600);

        setTimeout(function() {
          // Single white flash
          flashScreen('#fff', 150);
        }, 2200);

        setTimeout(function() {
          // Slow fade back
          screen.style.filter = 'none';
          body.style.background = '#050505';
          addDim('// konami.exe completed successfully');
          addDim('// memory wiped. returning to normal.');
          window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        }, 2800);

        setTimeout(function() {
          typeResponse("...anyway. where were we?", function() {
            addOptions(['plays', 'projects', 'pretend that didn\'t happen']);
          });
        }, 4500);
        return;
      }

      var key = steps[i];
      i++;
      typeResponse(pick(responses[key]), function() {
        if (i === 1) {
          // Flicker
          flashScreen('#0F0', 80);
          setTimeout(function() { flashScreen('#F0F', 60); }, 200);
        }
        if (i === 2) {
          // Screen inverts, text scrambles
          screen.style.filter = 'invert(1)';
          setTimeout(function() { screen.style.filter = 'none'; }, 300);
          scrambleAllText(800);
        }
        if (i === 3) {
          // Everything goes magenta
          var msgs = output.querySelectorAll('.msg-bot');
          msgs.forEach(function(m) { m.style.color = '#F0F'; });
          rapidFlicker(10, 80);
          setTimeout(function() {
            msgs.forEach(function(m) { m.style.color = '#0F0'; });
          }, 2000);
        }
        if (i === 4) {
          // Heavy shake + color cycling
          heavyShake(2000);
          body.style.background = '#0a000a';
          setTimeout(function() { body.style.background = '#000a0a'; }, 500);
          setTimeout(function() { body.style.background = '#0a0a00'; }, 1000);
        }
        if (i === 5) {
          // Screen goes black for a beat then comes back
          screen.style.filter = 'brightness(0)';
          setTimeout(function() {
            screen.style.filter = 'brightness(2)';
            setTimeout(function() { screen.style.filter = 'none'; }, 200);
          }, 800);
        }
        if (i === 6) {
          // Everything calms. dead silence. then the real message.
          clearInterval(glitchInterval);
          screen.style.transform = 'none';
          screen.style.filter = 'none';
          body.style.background = '#050505';
        }
        setTimeout(nextStep, 1400 + Math.random() * 600);
      });
    }

    setTimeout(nextStep, 1500);
  }

  // Konami code listener
  var konamiSeq = [38,38,40,40,37,39,37,39,66,65], konamiIdx = 0;
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === konamiSeq[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiIdx = 0;
        handleInput('konami');
      }
    } else {
      konamiIdx = 0;
    }
  });

  return {
    start: function() {
      inputLine.style.display = 'flex';
      // Only auto-focus on non-touch devices to prevent mobile keyboard popup
      if (!('ontouchstart' in window)) input.focus();
      typeResponse("hey. i'm ryann's portfolio. ask me anything or pick one:", function() {
        addOptions(['plays', 'projects', 'who is ryann', 'contact']);
      });
    },
    handleInput: handleInput
  };
})();

document.addEventListener('click', function(e) {
  // Skip auto-focus on touch devices to prevent mobile keyboard popup
  if ('ontouchstart' in window) return;
  // Don't steal focus from buttons, links, or images
  if (e.target.closest('button, a, img, .msg-option, .msg-options, .msg-images, .msg-link')) return;
  var inp = document.getElementById('input');
  if (inp && !document.getElementById('lightbox')?.classList.contains('open')) inp.focus();
});

// Console Easter egg
console.log('%c RYANN LYNN MURPHY ', 'background: #000; color: #0F0; font-size: 16px; padding: 8px; font-family: Courier New;');
console.log('%c Playwright / Technologist', 'color: #666; font-size: 12px; font-family: Courier New;');
console.log('%c if you\'re reading this you\'re either hiring me or judging my code.', 'color: #555; font-size: 10px;');
console.log('%c either way, hi.', 'color: #555; font-size: 10px;');
