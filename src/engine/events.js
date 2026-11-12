// Narrative events. Each choice carries an effect object (see sim.applyEffects) and an outcome text.
import { national, hasMajority, hostileSeats, govSeats, successionEnding, finalEnding, swing, crisisLevel } from './sim.js';

const P = (st) => st.player.name.trim().split(/\s+/).pop();
const inGov = (st, p) => st.gov.includes(p);
const pc = (v) => Math.round(v);

export function presidentialOdds(st) {
  const n = national(st.support), L = st.stats.legitimacy;
  let braun = n.SPD + n.DDP + n.Z * 0.7 + (L - 50) * 0.25 + n.KPD * 0.12;
  let hitler = n.NSDAP + n.DNVP * 0.45 + n.OTH * 0.4 + n.DVP * 0.2;
  let hind = n.DNVP * 0.55 + n.DVP * 0.8 + n.Z * 0.3 + n.OTH * 0.6 + st.stats.hindenburg * 0.06;
  const tot = braun + hitler + hind;
  return { braun: (braun / tot) * 100, hitler: (hitler / tot) * 100, hind: (hind / tot) * 100 };
}

export const EVENTS = [
  // ------------------------------------------------------------------ 1928
  { id: 'cabinet', t: 0, speaker: 'puender', loc: [13.4, 52.52], place: 'Reich Chancellery, Wilhelmstraße 77', title: 'A Cabinet of Personalities',
    text: (st) => [
      `"Herr Reichskanzler." Pünder lets the title hang in the air a moment, as if to see whether it fits. "Congratulations are in order. One hundred and fifty-three seats. The best result for your party since the National Assembly."`,
      `He lays two sheets of paper side by side on the green baize. "Now the arithmetic. With Zentrum, the Bavarians and the Democrats you would have two hundred and fifty-six of four hundred and ninety-one. A majority of ten — on the days when the Bavarians feel like turning up."`,
      `"Or you bring in Dr. Stresemann's People's Party. Three hundred and one seats. The Great Coalition. But the gentlemen of the DVP speak for heavy industry, Herr ${P(st)}, and they will make you pay for every vote in social policy. Stresemann cables from his sanatorium that he is willing. His own party is rather less so."`,
    ],
    choices: [
      { label: 'The Great Coalition. The Republic needs a broad base — from Social Democracy to the People\'s Party.',
        eff: { gov: ['SPD', 'DDP', 'Z', 'DVP'], coalition: -4, industry: 6, unions: -3, hindenburg: 3, rel: { DVP: 20 }, flags: { grand: true } },
        result: 'Stresemann forces his reluctant party into line by telegram. It is a cabinet of strong men who agree on very little — but it commands three hundred and one votes.' },
      { label: 'The Weimar Coalition. Better a small majority that wants the same things than a large one at war with itself.',
        eff: { gov: ['SPD', 'DDP', 'Z'], coalition: 10, unions: 5, industry: -5, hindenburg: -4, rel: { DVP: -12, Z: 6 }, flags: { weimarCoalition: true } },
        result: 'Stresemann stays at the Foreign Office as a "personality", without binding his party. You have a government of republicans, and a majority that a bad bout of influenza could erase.' },
    ] },

  { id: 'panzerkreuzer', t: 0, speaker: 'groener', loc: [10.13, 54.32], place: 'Cabinet room · August 1928', title: 'Panzerkreuzer A',
    text: () => [
      `General Groener does not raise his voice. He never does. "The first instalment for the armoured cruiser was voted by the last Reichstag. The keel plates are ordered at Kiel. I ask the cabinet to release the funds."`,
      `Across the table Hilferding studies his fingernails. Every man in the room remembers the posters your party hung in May: <em>Food for children, not armoured cruisers!</em> Nine million marks this year. Eighty million before she is launched.`,
      `"The Navy has kept faith with this state," Groener says. "If the first act of a Social Democratic Chancellor is to break a commitment to the armed forces, I cannot answer for the conclusions the officer corps will draw. Nor could I remain in office."`,
    ],
    choices: [
      { label: 'Release the funds. A government that wants the army\'s loyalty must keep the state\'s word.',
        eff: { reichswehr: 12, hindenburg: 6, unions: -5, legitimacy: -2, kpdMomentum: 0.12, swing: [['SPD', 'KPD', 0.7, 'urban']], flags: { cruiser: true } },
        result: 'The cabinet approves. Within the week the Communists launch a petition for a plebiscite against "the cruiser Chancellor", and your own Reichstag group passes a motion of regret against its own ministers.' },
      { label: 'Strike the cruiser from the budget. We promised the voters, and children are hungry.',
        eff: { reichswehr: -16, hindenburg: -9, unions: 6, legitimacy: 2, coalition: -5, treasury: 0.5, kpdMomentum: -0.06 },
        result: 'Groener offers his resignation; Hindenburg refuses to accept it and summons you instead for a very cold quarter of an hour. The party press celebrates. In the officers\' messes they are already calling you "the November Chancellor".' },
      { label: 'Postpone. Refer the instalment to the budget committee and let the Reichstag decide in the spring.',
        eff: { reichswehr: -5, hindenburg: -2, coalition: -2, legitimacy: -1 },
        result: 'Nobody is satisfied, which Pünder assures you is the mark of a workable compromise. Groener stays. The cruiser will be back.' },
    ] },

  { id: 'ruhr', t: 1, speaker: 'wissell', loc: [7.01, 51.45], place: 'Ruhr district · November 1928', title: 'The Lockout on the Ruhr',
    text: () => [
      `"Two hundred and thirty thousand men," says Wissell. "Locked out since the first of November. In the cold."`,
      `The state arbitrator awarded the iron and steel workers six pfennigs an hour. Wissell declared the award binding, as the law allows. The ironmasters of the north-west group answered by closing every gate from Duisburg to Dortmund. They are not fighting six pfennigs. They are fighting compulsory arbitration itself — the keystone of the Republic's social order.`,
      `"The unions' strike funds do not cover a lockout. The municipalities are feeding families from the poor relief. The Reichstag would vote public support for the locked-out men tomorrow, if we asked it. The employers call that taking sides." He looks at you. "They are right. It is."`,
    ],
    choices: [
      { label: 'Uphold the award in full and pay state support to the locked-out workers.',
        eff: { unions: 10, industry: -12, treasury: -1, legitimacy: 2, coalition: -4, rel: { DVP: -10, Z: 4 }, kpdMomentum: -0.05 },
        result: 'The Reichstag votes relief by a huge majority — even Zentrum deputies from the pit villages. The ironmasters give way in December, and do not forget. From now on the Ruhr\'s political funds flow further to the right.' },
      { label: 'Send Severing as special mediator. Trim the award, but make the employers accept arbitration.',
        eff: { unions: 2, industry: -3, coalition: 2, stability: 2 },
        result: 'Severing, the old metalworker, hands down a judgment of Solomon: a smaller raise, shorter hours later. Both sides sign. The principle of state arbitration survives, visibly wounded.' },
      { label: 'Stay out of it. The state cannot dictate wages in an industry that is losing money.',
        eff: { unions: -12, industry: 9, legitimacy: -3, rel: { DVP: 8 }, kpdMomentum: 0.12, swing: [['SPD', 'KPD', 0.6, 'RHL'], ['SPD', 'KPD', 0.6, 'WES']] },
        result: 'The award is quietly withdrawn. In Bochum a union secretary tears up his party card in front of the pithead baths. The Communists print the photograph.' },
    ] },

  // ------------------------------------------------------------------ 1929
  { id: 'winter29', t: 2, speaker: 'hilferding', loc: [13.4, 52.52], place: 'Reich Finance Ministry · February 1929', title: 'The Empty Till',
    text: () => [
      `Hilferding has the look of a man who has been adding up the same column all night. "The unemployment insurance fund was built for eight hundred thousand claimants. This morning there are over three million. The fund is borrowing from the Reich, and the Reich —" he spreads his hands — "is borrowing by the month."`,
      `"Three and a half per cent of wages instead of three would close the gap. The unions accept it. The employers pay half of every contribution, so the People's Party will not hear of it. They want the benefits cut instead."`,
      `"Or we lend the fund what it needs and hope for a mild spring. I am a Marxist, Herr Reichskanzler. I do not put much faith in hope."`,
    ],
    choices: [
      { label: 'Raise the contribution. Insurance must stand on its own feet — and the benefits are untouchable.',
        eff: { treasury: 1.5, unions: 5, industry: -6, coalition: -7, rel: { DVP: -9 } },
        result: 'You carry it through cabinet against the DVP ministers, who put their dissent on the record. The fund is solvent until the next bad winter.' },
      { label: 'Cover the deficit with a Reich loan. No new burdens in the middle of a frost.',
        eff: { treasury: -2.5, coalition: 2, unions: 2 },
        result: 'Hilferding signs the transfer with a sigh. The question is not settled, only postponed — and a postponed question in Weimar has a way of returning with friends.' },
      { label: 'Tighten eligibility: longer waiting periods, no benefit for seasonal workers.',
        eff: { treasury: 1.5, unions: -10, industry: 5, legitimacy: -3, rel: { DVP: 7 }, kpdMomentum: 0.1, swing: [['SPD', 'KPD', 0.5, 'urban']] },
        result: 'The building workers and farmhands fall out of the insurance and onto municipal poor relief. Wissell threatens to resign. He does not — this time.' },
    ] },

  { id: 'blutmai', t: 3, speaker: 'severing', loc: [13.38, 52.55], place: 'Berlin · the last week of April 1929', title: 'The First of May',
    text: () => [
      `"Zörgiebel will not lift the ban," Severing says. "He is a Social Democrat and a police president, and since December the second of those has had the upper hand."`,
      `All open-air demonstrations in Berlin have been forbidden for five months, after a winter of stabbings and shootings. Now the first of May approaches — labour's own holiday. The SPD and the unions will meet indoors. The Communists have announced that they will march through Wedding and Neukölln regardless, and Moscow would dearly like some martyrs made by a Social Democratic police.`,
      `"Thirteen thousand officers will be on the streets. Many of them are former Freikorps men who have been waiting years for the order. If the Communists build barricades, there will be dead." He folds his hands. "The Prussian police is Braun's, not yours. But a word from the Chancellor carries weight."`,
    ],
    choices: [
      { label: 'The ban stands. The state does not yield the street to those who want to destroy it.',
        eff: { stability: 3, leftStreet: -8, legitimacy: -3, hindenburg: 3, kpdMomentum: 0.2, swing: [['SPD', 'KPD', 0.9, 'BER'], ['SPD', 'KPD', 0.3, 'urban']], flags: { blutmai: true, rfbBanned: true } },
        result: 'Three days of shooting in Wedding and Neukölln. Thirty-three dead, none of them policemen; most were watching from windows. The Red Front is banned throughout the Reich. On the walls of the north of Berlin a new word appears next to your name: <em>Arbeitermörder</em>.' },
      { label: 'Urge Braun to lift the ban for the day. Workers shot by a Social Democratic police would haunt us for a generation.',
        eff: { stability: -5, leftStreet: 5, hindenburg: -5, legitimacy: 1, rel: { DVP: -6, DNVP: -5 }, kpdMomentum: -0.08 },
        result: 'A hundred thousand march under red flags. There are brawls at the Bülowplatz, a looted shop or two, forty arrests — and no dead. The right-wing press prints a cartoon of you handing Berlin\'s keys to Thälmann.' },
      { label: 'Keep the ban, but order restraint: batons and fire hoses, no rifles, no armoured cars.',
        eff: { stability: 1, leftStreet: -2, legitimacy: -1, kpdMomentum: 0.06, swing: [['SPD', 'KPD', 0.3, 'BER']], flags: { rfbBanned: true } },
        result: 'It is ugly, but it is not a massacre. Four dead in two days, each of them a front page in the Rote Fahne. The Red Front is banned; it will re-form under other names.' },
    ] },

  { id: 'young', t: 4, speaker: 'stresemann', loc: [5.6, 52.1], place: 'The Hague · August 1929', title: 'The Young Plan',
    text: () => [
      `Stresemann is grey as paper. He has had two strokes, and his doctors have forbidden him this conference. He came anyway.`,
      `"Two billion marks a year, falling later. Fifty-nine years. I know how that sounds." He stops for breath. "But the Dawes controls go — no more foreign agents in the Reichsbank and the railways. And the French leave the Rhineland by the thirtieth of June next year. Five years early. Mainz, Koblenz, the Palatinate. Free."`,
      `"Hugenberg will call it the enslavement of our grandchildren. He has found himself a drummer, that man Hitler, to shout it in the beer halls. Let them. I have spent six years buying this country its freedom by instalments." He looks at you with something like urgency. "I do not have six more. Sign it, Herr Reichskanzler."`,
    ],
    choices: [
      { label: 'Accept the Young Plan. Liberation of the Rhineland is worth a schedule nobody believes will run to 1988.',
        eff: { legitimacy: 2, coalition: 3, treasury: 1.5, rel: { DVP: 8, DNVP: -10 }, nsMomentum: 0.1, flags: { youngAccepted: true } },
        result: 'Germany signs. The nationalist "Reich Committee" opens its campaign for a plebiscite the same week — and Hugenberg\'s newspapers, newsreels and wire service put Hitler\'s face before millions who had never heard of him.' },
      { label: 'Hold out. Demand lower annuities and the return of the Saar as the price of signature.',
        eff: { treasury: -1.5, coalition: -5, stability: -2, rel: { DVP: -8, DNVP: 4 }, flags: { youngAccepted: true, youngLate: true } },
        result: 'Snowden of the British Treasury is rude, Briand is hurt, and the bankers grow nervous. After three weeks you sign almost the same text. Stresemann returns to Berlin an exhausted man; the nationalists call the delay proof that the plan was shameful all along.' },
      { label: 'Refuse. No German government can bind the third generation.',
        eff: { treasury: -4, coalition: -14, stability: -4, legitimacy: -2, industry: -8, hindenburg: 2, rel: { DVP: -20, DNVP: 12, Z: -8 }, nsMomentum: -0.1, flags: { youngRejected: true } },
        result: 'For one week the nationalist papers praise you. Then the short-term loans begin to go home to New York. The French garrisons stay on the Rhine. Stresemann does not speak to you again.' },
    ] },

  { id: 'stresemann_death', t: 5, speaker: 'puender', loc: [13.4, 52.52], place: 'Berlin · 3 October 1929', title: 'The Death of Stresemann',
    text: (st) => [
      `Pünder brings the news himself, at a quarter past five in the morning. A second stroke in the night. He was fifty-one.`,
      `By noon the Wilhelmstraße is black with people. Workers, bank clerks, a few elderly officers. No one has organised them. The Republic never loved Gustav Stresemann while he lived; this morning it seems to understand what he was holding up.`,
      inGov(st, 'DVP') ? `"His party will not hold without him," Pünder says quietly. "Scholz and the industrial wing have waited years for this. They will want the next foreign minister, and they will want you to pay for him in the budget."`
        : `"The People's Party will move right without him," Pünder says quietly. "And we must name a successor today. Curtius is the obvious choice. He is no Stresemann."`,
    ],
    choices: [
      { label: 'Appoint Julius Curtius of the DVP. Continuity in foreign policy, and a hand held out to his party.',
        eff: { coalition: 3, rel: { DVP: 8 }, industry: 2 },
        result: 'Curtius is competent, cautious, and nobody\'s idea of a statesman. The DVP elects Ernst Scholz as chairman within the month. The bridge Stresemann built between the workers\' party and the bourgeoisie now rests on one pillar.' },
      { label: 'Take the Foreign Office yourself for the time being. His policy of understanding is the government\'s policy.',
        eff: { legitimacy: 2, coalition: -6, rel: { DVP: -12 }, hindenburg: -3, capital: -1 },
        result: 'You speak at the graveside in the Luisenstadt cemetery, and for a day the whole country listens. The People\'s Party takes it as a declaration of war, which in a sense it is.' },
      { label: 'Offer the post to Rudolf Breitscheid, the SPD\'s foreign-policy spokesman.',
        eff: { coalition: -10, unions: 2, rel: { DVP: -18, Z: -4 }, hindenburg: -8 },
        result: 'Hindenburg signs the appointment only after Meissner has reminded him twice that he must. "A red in the Foreign Office," the old man is heard to say. "Bismarck would turn in his grave."' },
    ] },

  { id: 'liberty_law', t: 5, speaker: 'hugenberg', loc: [11.08, 49.45], place: 'Autumn 1929 · the plebiscite campaign', title: 'The "Freedom Law"',
    when: (st) => !st.flags.youngRejected,
    text: () => [
      `Privy Councillor Hugenberg owns the Scherl newspapers, the Telegraphen-Union wire service and the UFA film studios. This autumn every one of them carries the same message.`,
      `His "Law against the Enslavement of the German People" would repudiate the war-guilt clause, halt all reparations — and, in its fourth paragraph, send any minister who signs the Young Plan to the penitentiary for treason. That means you.`,
      `It will fail; the constitution demands twenty-one million votes. But at Hugenberg's side on every platform stands the Austrian from Munich, lifted overnight from the beer halls into respectable company, and the Ruhr money that follows Hugenberg has begun to find its way to him too.`,
    ],
    choices: [
      { label: 'Fight it in the open: radio, posters, ministers on every platform. Explain what the Rhineland\'s freedom is worth.',
        eff: { legitimacy: 3, nsMomentum: -0.08, capital: -1, rel: { DNVP: -6 } },
        result: 'The plebiscite gets 13.8 per cent. Twelve moderate German Nationals leave Hugenberg\'s party in disgust. It is a defeat for him — though the drummer has learned how large a hall he can fill.' },
      { label: 'Forbid civil servants to sign the petition, on pain of dismissal. The state need not pay its own gravediggers.',
        eff: { stability: 2, legitimacy: -3, hindenburg: -6, nsMomentum: 0.12, rel: { DNVP: -14, DVP: -5 }, flags: { civilServantBan: true } },
        result: 'The State Court strikes down part of your decree. Hugenberg has his martyrs — schoolmasters and postal inspectors "persecuted for their convictions" — and the President lets it be known that he found the measure distasteful.' },
      { label: 'Ignore it. To answer Hugenberg is to dignify him.',
        eff: { nsMomentum: 0.22, legitimacy: -1 },
        result: 'The plebiscite fails all the same. But for ten weeks only one side was speaking, and four million people who signed their names against "the tribute" have now been told who their friends are.' },
    ] },

  // ------------------------------------------------------------------ 1930
  { id: 'insurance30', t: 6, speaker: 'bruening', loc: [13.38, 52.52], place: 'Reichstag, committee room 12 · March 1930', title: 'A Quarter of One Per Cent',
    text: (st) => [
      `Heinrich Brüning speaks as he always does: softly, precisely, like a man reading out a will.`,
      inGov(st, 'DVP')
        ? `"The People's Party will not accept a contribution of four per cent. Your trade unions will not accept a cut in benefits. The unemployment fund is three hundred millions short. I propose that we decide nothing: the Reich lends the fund a fixed sum this year, and the question of contributions or cuts is settled in the autumn." He does not add: when there will be more unemployed and less money, and the cuts will be unavoidable.`
        : `"My party has supported this government loyally. But the unemployment fund is three hundred millions short, and Zentrum cannot answer to its voters for an unbalanced budget. I propose a fixed Reich loan this year. The question of contributions or cuts is settled in the autumn." He does not add: when the cuts will be unavoidable.`,
      `Wissell is white with anger. Leipart telephoned at noon: the unions regard the compromise as the first step in dismantling the insurance, and the Reichstag group will follow the unions. In the corridor, General von Schleicher's adjutant is waiting — for no reason anyone can name.`,
    ],
    choices: [
      { label: 'Accept Brüning\'s compromise and force it through your own party. The coalition is worth more than a quarter of a per cent.',
        eff: { coalition: 8, unions: -14, legitimacy: -1, treasury: -1, rel: { Z: 8, DVP: 6 }, kpdMomentum: 0.1, flags: { brueningCompromise: true } },
        result: 'You threaten the Reichstag group with your resignation, and it gives way by eleven votes. Wissell resigns. The government survives the spring. In the President\'s palace, a plan that was ready for use is put back in its drawer.' },
      { label: 'Insist on four per cent. If the People\'s Party wants to break the government over the unemployed, let it do so in public.',
        req: (st) => inGov(st, 'DVP'), reqText: 'Only with the DVP in government',
        eff: { leave: 'DVP', unions: 10, coalition: 6, industry: -10, hindenburg: -8, treasury: 1, rel: { DVP: -30 }, flags: { dvpLeft: true } },
        result: 'The DVP ministers resign that evening. You govern on with Zentrum and the Democrats — two hundred and fifty-six votes, if every Bavarian is in his seat. Schleicher\'s friends tell the President that the "Marxist experiment" is finished. It is not, quite.' },
      { label: 'Refuse the compromise and raise contributions by decree of the cabinet majority.',
        req: (st) => !inGov(st, 'DVP'), reqText: 'Only without the DVP in government',
        eff: { unions: 8, coalition: -12, hindenburg: -5, treasury: 1, rel: { Z: -12 } },
        result: 'Brüning says nothing at all, which those who know him recognise as fury. The Zentrum ministers stay — under protest, and counting.' },
      { label: 'Resign. No Social Democrat can put his name to this — and none should rule against his own movement.',
        eff: { end: 'resigned' },
        result: 'On the evening of the twenty-seventh of March you drive to the Presidential Palace and return the seals of office.' },
    ] },

  { id: 'frick', t: 6, speaker: 'severing', loc: [11.33, 50.98], place: 'Weimar · January 1930', title: 'The Thuringian Experiment',
    text: () => [
      `"Six seats in a Landtag of fifty-three," Severing says, "and they have the Interior and Education ministries for it. The bourgeois parties in Weimar wanted a majority without us. This was the price."`,
      `Dr. Wilhelm Frick, convicted of high treason for his part in the Munich putsch, now commands the police of a German state. He has begun to purge republican officers and to introduce prayers in the schools asking God to deliver Germany from "deceit and treason". A chair in "racial science" is to be created at Jena.`,
      `"The Reich pays a subsidy toward every Land's police. I can suspend it for Thuringia until Frick restores the dismissed men. The Länder will howl about their rights — and not only Thuringia."`,
    ],
    choices: [
      { label: 'Suspend the police subsidy. The Reich does not finance its enemies.',
        eff: { rightStreet: -4, nsMomentum: -0.08, legitimacy: 2, rel: { DNVP: -6, Z: -3 }, hindenburg: -2 },
        result: 'Frick blusters, sues before the State Court, and after a year is voted out by his own tired coalition partners. Elsewhere, bourgeois politicians tempted by the same arithmetic take note of how the experiment ended.' },
      { label: 'Protest formally, but leave the money. Federalism is the Republic\'s law too — Bavaria is watching.',
        eff: { nsMomentum: 0.1, rightStreet: 3, rel: { Z: 3 } },
        result: 'Frick governs on, unmolested, for fourteen months. When he finally falls, the National Socialists have learned exactly how a ministry is used — and the country has learned to think of them as people who hold ministries.' },
    ] },

  { id: 'camarilla', t: 7, speaker: 'schleicher', loc: [13.36, 52.51], place: 'Bendlerstraße · May 1930', title: 'The General\'s Luncheon',
    text: (st) => [
      `Kurt von Schleicher is charming. It is his profession. He has no command and no ministry — only an office, a telephone, and the ear of the President's son.`,
      `"Between us, Herr Reichskanzler: the Field Marshal is unhappy. He is eighty-two. He would like, before he dies, to see a government that stands above the parties. National men. No Reichstag haggling." A smile. "He has Article 48, and he has been told he may use it for a Chancellor of his own choosing. I thought you should hear it from a friend."`,
      `Then, lightly: "Of course, the old gentleman is also a landowner now. His neighbours in East Prussia are drowning in debt. A Chancellor who understood the needs of the East..." He lets the sentence finish itself. ${st.stats.reichswehr < 40 ? 'You notice that he has not once called the army yours.' : ''}`,
    ],
    choices: [
      { label: 'Take the hint. Promise the President a generous programme of aid for eastern agriculture.',
        eff: { hindenburg: 10, treasury: -2, unions: -4, rel: { DNVP: 6 }, policy: { osthilfe: 1 }, flags: { osthilfePromise: true } },
        result: 'The first hundred millions go east before the summer. Much of it, your auditors will later find, pays off the gambling debts and motor-cars of gentlemen with very old names. But the invitations to Neudeck resume.' },
      { label: 'Go to Groener. The Minister should know what his protégé is saying over lunch.',
        eff: { reichswehr: 4, hindenburg: -3, flags: { groenerWarned: true } },
        req: (st) => st.stats.reichswehr >= 40, reqText: 'Requires Reichswehr loyalty 40',
        result: 'Groener hears you out, heavy-lidded. "Schleicher is my adopted son," he says at last. "I will speak to him." For a season the General is noticeably more careful. He does not stop.' },
      { label: 'Tell him plainly: this government rests on the Reichstag, and will be removed by the Reichstag or not at all.',
        eff: { hindenburg: -8, legitimacy: 3, reichswehr: -4, coalition: 3 },
        result: '"A pity," Schleicher says, still smiling, and signals for the bill. That evening Meissner notes in his diary that the Chancellor "lacks the necessary flexibility".' },
    ] },

  { id: 'budget30', t: 8, speaker: 'hilferding', loc: [13.38, 52.52], place: 'Reichstag · July 1930', title: 'Covering the Deficit',
    text: (st) => [
      `Eight hundred million marks. The slump has eaten the revenue; the unemployed have eaten the reserves. The cover bill before the house contains something to offend everyone: a levy on civil servants, a tax on bachelors, a poll tax the Left calls the "Negro tax", cuts to benefits.`,
      `${hasMajority(st) ? `On paper your coalition has ${govSeats(st)} of ${st.totalSeats} votes.` : `Your government has only ${govSeats(st)} of ${st.totalSeats} votes.`} "On paper," Hilferding repeats. "The Bavarians object to the beer tax, half our own people object to the poll tax, and the opposition objects to our existence."`,
      `"There are three ways through. We rewrite the bill until the coalition can swallow it. Or the President enacts it under Article 48 — and if the Reichstag votes to annul the decree, he dissolves the house. Or you dissolve at once and ask the country." He takes off his pince-nez. "I would not ask this country anything just now. Not with three million unemployed and that man filling the Sportpalast."`,
    ],
    choices: [
      { label: 'Negotiate. Drop the poll tax, add a surcharge on high incomes, and pass it through the house.',
        req: (st) => hasMajority(st) && st.stats.coalition >= 38, reqText: 'Requires a majority and coalition cohesion 38',
        eff: { treasury: 3, coalition: -8, industry: -4, legitimacy: 3, capital: -1, policy: { taxes: 1 }, flags: { budgetPassed: true } },
        result: 'It takes eleven days and two all-night sittings. The bill passes by nineteen votes. There is no dissolution, no election — and the twelve National Socialists in the house remain twelve, shouting from the back benches of a parliament that still works.' },
      { label: 'Ask the President for an emergency decree under Article 48.',
        req: (st) => st.stats.hindenburg >= 50 && !st.flags.republicanPresident, reqText: 'Requires Hindenburg\'s confidence 50',
        eff: { treasury: 4, legitimacy: -4, hindenburg: -5, unions: -5, decree: 1, policy: { austerity: 1 } },
        fn: (st) => {
          if (hasMajority(st) && st.stats.coalition >= 30) return 'The decree is published in the Reich Law Gazette. A Communist motion to annul it fails; your coalition, grumbling, lets it stand. A precedent has been set that others will find convenient.';
          st.electionPending = true; st.flags.dissolved30 = true;
          return 'Social Democrats of your own left wing vote with Communists, Nationalists and Nazis to annul the decree: 236 to 221. Pünder hands you the red folder with the President\'s order of dissolution. Germany will vote on the fourteenth of September.';
        } },
      { label: 'Dissolve the Reichstag. Let the voters judge between the Republic and its enemies.',
        eff: { election: true, legitimacy: 1, flags: { dissolved30: true } },
        result: 'The order of dissolution is read to a howling chamber. The campaign that follows is the most violent since 1920. Goebbels has six thousand meetings scheduled before you have printed your first poster.' },
    ] },

  { id: 'ulm', t: 9, speaker: 'groener', loc: [12.37, 51.34], place: 'Reich Court, Leipzig · September 1930', title: 'The Oath of Legality',
    text: () => [
      `Three lieutenants of the Ulm artillery garrison stand accused of forming National Socialist cells in the army. Their defence has called the party's leader as a witness.`,
      `Under oath, in a packed courtroom, Hitler swears that his movement will take power by strictly constitutional means. And then, with the reporters of the world writing it down: "When we have won, there will be a State Court, November 1918 will be atoned for — and heads will roll."`,
      `Groener sets down the transcript. "My young officers read this. Half the subalterns believe the lieutenants did nothing dishonourable. Schleicher tells me one must not drive good national youth into opposition." He rubs his eyes. "I can make an example. Or I can make a speech. Tell me which the government wants."`,
    ],
    choices: [
      { label: 'An example. Dishonourable discharge, fortress confinement, and an order of the day: the Reichswehr serves the state, not a party.',
        eff: { reichswehr: -5, rightStreet: -3, nsMomentum: -0.07, legitimacy: 2, flags: { armyPurge: true } },
        result: 'The lieutenants get eighteen months. Groener\'s order is read at every roll-call. There is muttering in the messes — but the next Nazi cell-builder in uniform knows the price.' },
      { label: 'Leniency. The army must not be torn apart over three foolish boys.',
        eff: { reichswehr: 6, nsMomentum: 0.1, rightStreet: 3 },
        result: 'The sentences are light and half is remitted. One of the three, in his cell, converts to Communism and says so in the press, which pleases nobody. The junior officer corps draws its own conclusions about which way the wind blows.' },
      { label: 'Use the trial. Have the Prussian government publish its dossier: the oath is perjury, and here is the proof.',
        req: (st) => st.stats.stability >= 40, reqText: 'Requires public order 40',
        eff: { nsMomentum: -0.14, legitimacy: 2, hindenburg: -3, rel: { DNVP: -6 }, flags: { dossier: true } },
        result: 'Braun\'s Interior Ministry lays out four hundred pages of SA orders, arms purchases and plans for "the day". The bourgeois press, for once, reads them. The Reich prosecutor declines to act — but the word "legal" now sticks in a few respectable throats.' },
    ] },

  // ------------------------------------------------------------------ 1931
  { id: 'zollunion', t: 10, speaker: 'curtius', loc: [16.37, 48.2], place: 'Foreign Office · March 1931', title: 'The Customs Union',
    text: () => [
      `"It is ready for signature," says Curtius, with the air of a man producing a rabbit. "A customs union between the Reich and the Republic of Austria. No tariffs from Hamburg to the Burgenland."`,
      `He has negotiated it in secret with Vienna. At home it would be a triumph: the first step toward the <em>Anschluss</em> that Social Democrats and nationalists alike have wanted since 1918, a success to wave at Hugenberg and Hitler.`,
      `"Paris will protest. They will say it breaches the treaties." A small shrug. "Let them." What Curtius does not say — what Hilferding said to you an hour ago — is that Germany and Austria live on short-term French and American credit, and that credit can be withdrawn by telephone.`,
    ],
    choices: [
      { label: 'Announce it. The Republic needs one success in foreign policy that the nationalists cannot spit on.',
        eff: { legitimacy: 3, nsMomentum: -0.05, treasury: -2, hindenburg: 4, rel: { DNVP: 5, DVP: 6 }, flags: { tradeWar: true, zollunion: true } },
        result: 'Berlin cheers for a fortnight. Then French banks begin to withdraw their deposits from Vienna and Berlin. In May the Creditanstalt fails. In September, humiliated, Curtius renounces the project at Geneva — two days before the Hague Court would have forbidden it.' },
      { label: 'Bury it. We cannot provoke our creditors in the middle of a banking panic.',
        eff: { rel: { DVP: -6, DNVP: -4 }, coalition: -2, stability: 1 },
        result: 'The draft goes into the archive. Curtius sulks. When the Creditanstalt collapses in May anyway, at least no one in Paris can say that Berlin lit the fuse.' },
      { label: 'Turn it round. Offer Paris a Franco-German economic understanding — credits against a political truce.',
        req: (st) => st.flags.youngAccepted && !st.flags.youngLate, reqText: 'Requires that the Young Plan was accepted without delay',
        eff: { treasury: 4, legitimacy: -1, nsMomentum: 0.06, industry: 4, hindenburg: -4, rel: { DNVP: -10 }, flags: { frenchCredit: true } },
        result: 'Briand, old and ailing, seizes the hand. A French credit of half a billion is arranged against Germany\'s promise to raise no treaty questions for two years. Hugenberg\'s papers print your portrait under a kepi. The Reichsbank\'s reserves, for the first time in a year, stop falling.' },
    ] },

  { id: 'fork31', t: 11, speaker: 'woytinsky', loc: [13.4, 52.5], place: 'ADGB headquarters, Inselstraße · Spring 1931', title: 'Two Doctors at the Sickbed',
    text: () => [
      `They have brought their quarrel to you because they can no longer bear to conduct it in private.`,
      `Woytinsky, the unions' statistician, an exile who once sat in the Petrograd Soviet, spreads his charts across the table. "The crisis is not curing itself. Every wage cut shrinks demand, every bankruptcy breeds another. The state must create purchasing power: a million men on public works, paid with Reichsbank credit. Two billion marks. If we do not give the unemployed work, <em>others</em> will promise it to them."`,
      `Hilferding answers as the party's greatest theoretician — and as the minister of 1923, who watched the mark die. "Colleague Woytinsky wishes to cure capitalism with the printing press. The crisis must run its course; our task is to protect the currency and the social insurance until it does. Say the word <em>credit</em>, and every pensioner in Germany will hear the word <em>inflation</em>."`,
    ],
    choices: [
      { label: 'Woytinsky is right. Have the ADGB draft a work-creation bill for the Reichstag.',
        eff: { unions: 10, industry: -6, coalition: -6, inflation: 6, rel: { DVP: -10, Z: -4 }, flags: { wtbDraft: true } },
        result: 'Hilferding offers to resign and is persuaded to stay "in order to limit the damage". The memorandum that bears three names — Woytinsky, Tarnow, Baade — is on your desk within the month. Now it needs a majority, or a miracle.' },
      { label: 'Hilferding is right. The currency is the one thing this Republic has rebuilt; we will not gamble it.',
        eff: { unions: -10, industry: 6, coalition: 4, inflation: -5, treasury: 2, rel: { DVP: 6, Z: 5 }, policy: { austerity: 1 }, kpdMomentum: 0.1, nsMomentum: 0.08 },
        result: 'A new emergency budget cuts salaries, pensions and benefits by a further tenth. The Communists christen you the "hunger Chancellor". The Nazi press, which has no theory of money whatever, simply promises "work and bread".' },
      { label: 'A middle way: modest public works within the budget, financed by a crisis levy. No Reichsbank credit.',
        eff: { unions: 3, industry: -3, treasury: -1, policy: { works: 1, taxes: 1 }, rel: { DVP: -5 } },
        result: 'Road-building, land drainage, voluntary labour service for the young. A hundred and fifty thousand men find work. It is honest, it is solvent, and against six million it is a bucket in a burning house.' },
    ] },

  { id: 'danat', t: 12, speaker: 'luther', loc: [13.39, 52.515], place: 'Reichsbank · Sunday, 12 July 1931', title: 'The Run',
    text: (st) => [
      `Reichsbank President Luther has flown to London, Paris and Basel in three days, hat in hand, and come back with nothing.`,
      `"The Darmstädter und Nationalbank cannot open tomorrow. Nordwolle's losses have wiped it out. If the Danat closes, the Dresdner follows by Wednesday, and then the savings banks. ${st.flags.frenchCredit ? 'The French credit bought us six weeks. They are used up.' : 'We have lost two billion in gold and foreign exchange since May.'}"`,
      `The cabinet has sat since morning. The bankers in the anteroom blame each other. Outside, though it is Sunday, people are already queuing on the pavement of the Behrenstraße with their savings books. They remember 1923. Whatever you decide must be decided before the counters open.`,
    ],
    choices: [
      { label: 'Guarantee all deposits, close the banks for two days, and take the great banks into Reich ownership.',
        eff: { treasury: -4, legitimacy: 3, stability: 3, industry: -4, inflation: 4, unions: 4, flags: { banksNationalised: true } },
        result: 'The bank holiday holds. When the counters reopen, the Reich owns most of the Dresdner and a third of the Deutsche Bank — more socialisation in a weekend than your party managed in thirteen years, and nobody dares call it by its name.' },
      { label: 'Let the Danat fail. The state cannot cover the gambling losses of speculators.',
        eff: { treasury: 1, legitimacy: -8, stability: -8, unemp: 1.5, industry: -8, nsMomentum: 0.15, kpdMomentum: 0.1, flags: { bankCollapse: true } },
        result: 'By Tuesday every bank in Germany has closed its doors. Wages go unpaid; municipalities issue emergency scrip. In the queues they are not discussing monetary theory. They are saying that the system is finished.' },
      { label: 'Guarantee the deposits — and use the hour: declare that Germany can pay no more reparations.',
        eff: { treasury: -3, legitimacy: 5, stability: 1, hindenburg: 3, inflation: 4, rel: { DNVP: 4 }, flags: { banksNationalised: true, reparationsEnded: true } },
        result: 'Paris is furious; London and Washington, privately, are relieved that someone has said it. The Hoover moratorium becomes a standstill, and the standstill, at Lausanne, becomes the end. Hugenberg has spent a decade promising to tear up the tribute. A Social Democrat has done it.' },
    ] },

  { id: 'harzburg', t: 13, speaker: 'braun', loc: [10.56, 51.88], place: 'Prussian State Ministry · November 1931', title: 'Harzburg and Boxheim',
    text: () => [
      `Otto Braun, the "red Tsar of Prussia", fills an armchair as he fills his office: completely.`,
      `"In October they stood on one platform at Bad Harzburg — Hugenberg, Hitler, the Stahlhelm, Schacht, two sons of the Kaiser. Now this." He pushes a file across. A renegade Nazi deputy has handed the Frankfurt police the plans drawn up at the Boxheimer Hof by the party's Hessian leadership: on taking power, the SA shoots without trial anyone who resists, strikes, or keeps a weapon. Food only against labour service. Signed by a judge-in-training named Best.`,
      `"Hitler says he knew nothing of it. The Reich prosecutor says it is a 'private elaboration' and sees no urgency. I have ninety thousand police who will do as they are told — today. I cannot promise you next year."`,
    ],
    choices: [
      { label: 'Charge the authors with high treason, and prepare the ban of SA and SS throughout the Reich.',
        req: (st) => st.stats.hindenburg >= 35 || st.flags.republicanPresident, reqText: 'Requires Hindenburg\'s confidence 35',
        eff: { rightStreet: -8, nsMomentum: -0.12, legitimacy: 3, hindenburg: -6, reichswehr: -3, rel: { DNVP: -10 }, flags: { boxheimTrial: true } },
        result: 'For the first time the brown army is on the defensive. Best is dismissed from state service and indicted. Schleicher warns that one "must not push four hundred thousand good national lads into the arms of Moscow" — but for once he is not listened to.' },
      { label: 'Answer Harzburg in kind: unite the SPD, the unions, the Reichsbanner and the workers\' sport clubs in an "Iron Front".',
        eff: { reichsbanner: 18, unions: 6, legitimacy: 3, stability: 2, hindenburg: -3, kpdMomentum: -0.05, flags: { ironFront: true } },
        result: 'Three arrows on every wall: against monarchism, fascism and communism. In the Lustgarten a hundred thousand raise their fists. Whether they will be given anything to do with those fists is another question — but they have been counted, and so have their enemies.' },
      { label: 'Let the courts take their course. A government that panics makes its enemies look strong.',
        eff: { nsMomentum: 0.12, rightStreet: 5, legitimacy: -3, reichsbanner: -4 },
        result: 'The Boxheim case is opened, adjourned, and eventually dropped for lack of evidence of intent. Dr. Best will have a notable career.' },
    ] },

  // ------------------------------------------------------------------ 1932
  { id: 'presidency', t: 14, speaker: 'wels', loc: [13.4, 52.52], place: 'SPD executive, Lindenstraße · February 1932', title: 'Who Shall Be President?',
    text: (st) => { const o = presidentialOdds(st); return [
      `Otto Wels plants both fists on the table. "The old man's seven years are up. Hitler is running; the Brunswick Nazis have made him a German citizen for the purpose. Thälmann is running, so that the Communists can split what is left."`,
      `"The executive wants to know what our Chancellor proposes. Hindenburg is a monarchist who thinks you a traitor of 1918 — and he is the only man in Germany certain to beat Hitler. If we ask our people to vote for him, they will do it. They will do it with clenched teeth, and some of them will not forgive us."`,
      `"Or we put up one of our own. Braun would stand, if you asked him." He lowers his voice. "Pünder's office has run the numbers on a second ballot — Braun ${pc(o.braun)}, Hitler ${pc(o.hitler)}, Hindenburg ${pc(o.hind)}. You know what it means if those numbers are wrong."`,
    ]; },
    choices: [
      { label: '"Beat Hitler — vote Hindenburg." The lesser evil is still the lesser.',
        eff: { hindenburg: 6, unions: -4, legitimacy: 1, kpdMomentum: 0.1, swing: [['SPD', 'KPD', 0.6, 'urban']], flags: { hindenburgReelected: true } },
        result: 'Hindenburg wins the second ballot with nineteen million votes — Social Democratic and Catholic votes. He is not grateful. "Who elected me?" he complains to his son. "The Sozis and the blacks. My own people voted for the Bohemian corporal." He holds it against you.' },
      { label: 'Nominate Otto Braun. The Republic should, for once, be led by a republican.',
        hint: (st) => { const o = presidentialOdds(st); return `Estimate — Braun ${pc(o.braun)}% · Hitler ${pc(o.hitler)}% · Hindenburg ${pc(o.hind)}%`; },
        fn: (st) => {
          const o = presidentialOdds(st);
          const j = (st.seed % 7) - 3; // a little fog
          const b = o.braun + j * 0.5, h = o.hitler - j * 0.3, hi = o.hind;
          if (b > h && b > hi) {
            st.flags.republicanPresident = true; st.stats.hindenburg = 90; st.stats.legitimacy = Math.min(100, st.stats.legitimacy + 10);
            st.stats.reichswehr = Math.max(0, st.stats.reichswehr - 8); st.stats.nsMomentum -= 0.15;
            return 'On the night of the tenth of April the count comes in from Königsberg to Konstanz, and it holds. Otto Braun, printer\'s apprentice from East Prussia, is President of the German Reich. Hindenburg leaves the palace by a side gate without receiving his successor. In the Bendlerstraße the lights burn late — but the man who can dismiss you is now a friend.';
          }
          if (h >= b && h >= hi) { st.ended = 'president_hitler'; return 'The republican vote splits between Braun and the Field Marshal. In the second ballot, with a plurality of the votes cast, Adolf Hitler is elected President of the German Reich.'; }
          st.flags.hindenburgReelected = true; st.stats.hindenburg = Math.max(0, st.stats.hindenburg - 28); st.stats.legitimacy -= 3;
          return 'Braun runs bravely and comes second. Hindenburg is re-elected by the united Right — and this time he owes the Left nothing. He has not forgotten which Chancellor tried to put him out to pasture.';
        } },
      { label: 'Propose extending the President\'s term by constitutional amendment, and spare the country a campaign.',
        eff: { hindenburg: 4, nsMomentum: 0.1, legitimacy: -2, flags: { hindenburgReelected: true }, swing: [['SPD', 'KPD', 0.4, 'urban']] },
        result: 'It needs two-thirds of the Reichstag, which means it needs Hugenberg and Hitler. They let you court them for three weeks, then refuse with a flourish. The election takes place anyway; you back Hindenburg with nothing left to bargain; he wins, and remembers only that the idea came to nothing.' },
    ] },

  { id: 'saban', t: 15, speaker: 'groener', loc: [13.4, 52.52], place: 'Reich Interior Ministry · April 1932', title: 'Four Hundred Thousand Brownshirts',
    text: (st) => [
      `Groener looks ill. He is running two ministries and has a young wife, a new baby, and a former protégé who no longer returns his calls.`,
      `"The Länder have forced my hand. Prussia, Bavaria, Württemberg, Hesse — all demand it. On election night the SA stood to arms around Berlin, with lorries and alarm plans. That is a private army four times the size of the Reichswehr."`,
      `"I have a decree ready dissolving the SA and SS. ${st.flags.republicanPresident ? 'President Braun will sign within the hour.' : 'The President will sign — he has said so.'} But Schleicher has turned against it. He tells the generals I have lost the confidence of the army, he tells the President's son that it is unjust to ban the brown formations and leave your Reichsbanner untouched." He meets your eye. "If I do this, they will break me for it. I should like to know that it was worth it."`,
    ],
    choices: [
      { label: 'Sign it, enforce it, and stand by Groener when the storm breaks.',
        req: (st) => st.stats.hindenburg >= 30 || st.flags.republicanPresident, reqText: 'Requires Hindenburg\'s confidence 30',
        eff: { rightStreet: -22, stability: 6, nsMomentum: -0.12, hindenburg: -10, reichswehr: -8, legitimacy: 4, rel: { DNVP: -10 }, flags: { saBanned: true } },
        result: 'At dawn the police occupy the brown houses from Munich to Kiel. There is no resistance; the storm troopers go home and wait. In the Reichstag Groener is shouted down by the Nazi benches; you speak after him, and the house, astonished, hears a Chancellor defend his minister.' },
      { label: 'Ban them all: SA, SS, and the Communist leagues — and place the Reichsbanner under army supervision as an auxiliary.',
        eff: { rightStreet: -16, leftStreet: -10, reichsbanner: -15, stability: 5, reichswehr: 6, hindenburg: 2, unions: -8, legitimacy: -1, flags: { saBanned: true, rfbBanned: true } },
        result: '"Even-handedness," Schleicher calls it, pleased. The SA dissolves on paper. So does the only mass organisation that had sworn to defend you. Hörsing sends back his Order of Merit.' },
      { label: 'Hold the decree back. A banned SA is a martyred SA — and we cannot afford a break with the army.',
        eff: { rightStreet: 8, stability: -5, nsMomentum: 0.1, reichswehr: 5, legitimacy: -4, reichsbanner: -5 },
        result: 'The Länder governments are aghast. Bavaria threatens to act alone. In the working-class quarters, the lorries with the swastika pennants drive through every Sunday now, slowly, singing.' },
    ] },

  { id: 'altona', t: 16, speaker: 'meissner', loc: [9.93, 53.55], place: 'Presidential Palace · 18 July 1932', title: 'Order in Prussia',
    text: (st) => [
      `Yesterday seven thousand SA men marched, under police escort, through the red quarter of Altona. Shots from the rooftops, shots from the police. Eighteen dead.`,
      st.flags.republicanPresident
        ? `State Secretary Meissner, who has served Ebert and Hindenburg and now serves Braun with the same smooth face, lays a memorandum before you. "The generals and the gentlemen of the Herrenklub have a proposal, Herr Reichskanzler. They did not care to bring it to the President themselves."`
        : `State Secretary Meissner receives you in place of the President, who is "resting". He has a draft decree on the desk. "The Field Marshal has been advised, Herr Reichskanzler, by gentlemen whose judgment he trusts."`,
      `"Prussia has lost its majority and its government is merely a caretaker. It has plainly lost control of public order. The proposal is that the Reich appoint a commissioner, depose Braun and Severing, and take the Prussian police under its own command." A thin smile. "Under <em>your</em> command, naturally. For the present. ${st.flags.republicanPresident ? '' : 'The President would regard your signature as proof that you place the state above the party.'}"`,
    ],
    choices: [
      { label: 'Refuse. Prussia is the bulwark of the Republic; whoever wants its police must come through the Chancellor.',
        eff: { hindenburg: -12, legitimacy: 5, reichsbanner: 5, unions: 5, reichswehr: -5, stability: -2, flags: { prussiaHeld: true } },
        result: 'You have the refusal printed in the Vorwärts so that it cannot be mislaid. Severing doubles the guard on his ministry. The gentlemen of the Herrenklub conclude that nothing further can be done with you — only without you.' },
      { label: 'Sign. If the Reich must take Prussia, better that a republican holds the reins than whoever comes after.',
        eff: { hindenburg: 12, reichswehr: 8, legitimacy: -10, unions: -12, coalition: -10, stability: 3, reichsbanner: -10, kpdMomentum: 0.15, decree: 1, swing: [['SPD', 'KPD', 1.2, 'urban']], flags: { prussiaTaken: true } },
        result: 'Braun and Severing yield "only to force" — a lieutenant and two men suffice. Ninety thousand police pass to the Reich. You tell yourself that you have saved them from worse hands. The instrument is now ready, and it no longer matters to it who picks it up.' },
      { label: 'A third way: a joint Reich–Prussian security staff under Severing, and a three-month ban on all uniformed marches.',
        req: (st) => st.stats.stability >= 30, reqText: 'Requires public order 30',
        eff: { hindenburg: -4, stability: 5, rightStreet: -6, leftStreet: -5, legitimacy: 2 },
        result: 'It is a lawyer\'s solution, and it works as lawyers\' solutions do: tolerably. The summer passes with fewer funerals. Meissner files the unused decree where he can find it again.' },
    ] },

  { id: 'querfront', t: 17, speaker: 'schleicher', loc: [13.4, 52.52], place: 'Reichswehr Ministry · November 1932', title: 'The Diagonal Front',
    text: (st) => [
      `Schleicher has a new idea. He always has.`,
      `"The Nazi movement is past its peak. Their treasury is empty, the SA is mutinous, the industrialists are closing their purses. And Gregor Strasser — who built the party machine, who commands sixty deputies and the factory cells — is sick of waiting for Hitler's all-or-nothing."`,
      `"Offer Strasser the vice-chancellorship and a real programme of work creation. Bring in Leipart's unions on the other flank. A front diagonal to all the parties: soldiers, workers, the sensible Nazis. Hitler is left alone with Goebbels and his debts." He beams. "${st.stats.unions >= 55 ? 'Your friends in the ADGB are interested. They have told me so.' : 'Your friends in the ADGB could be persuaded.'} All it needs is a Chancellor with imagination."`,
    ],
    choices: [
      { label: 'Explore it. If the Nazi party can be split, the Republic has won.',
        fn: (st) => {
          const n = national(st.support).NSDAP;
          if (st.stats.nsMomentum < 1.0 || st.policy.works >= 2 || n < 26) {
            swing(st, 'NSDAP', 'OTH', 2.2); swing(st, 'NSDAP', 'DNVP', 1.2);
            st.stats.nsMomentum = Math.max(0.3, st.stats.nsMomentum - 0.3); st.stats.rightStreet = Math.max(0, st.stats.rightStreet - 8);
            st.stats.reichswehr = Math.min(100, st.stats.reichswehr + 6); st.stats.unions -= 4; st.flags.strasserSplit = true;
            return 'Strasser meets you twice, in secret, at Schleicher\'s flat. Hitler learns of it and stages a scene at the Kaiserhof — tears, threats of suicide. Strasser resigns all his offices, takes forty deputies and half the Gau treasurers with him into a "National Social" group, and the brown monolith cracks from top to bottom.';
          }
          st.stats.legitimacy -= 5; st.stats.unions -= 8; st.stats.nsMomentum += 0.08; st.stats.reichswehr += 3;
          return 'Strasser listens, hesitates, and then does what he has done all his life: he obeys. He goes on holiday to Italy. Hitler, his party behind him and rising, tells the world that a "Marxist Chancellor came begging to National Socialism". Your own party demands to know what you were doing in that flat.';
        } },
      { label: 'Decline. One does not save democracy with generals\' intrigues and half a fascist party.',
        eff: { reichswehr: -6, hindenburg: -4, legitimacy: 3, unions: 3 },
        result: 'Schleicher shrugs. "As you wish. But remember that I offered." He will try it himself, should he ever get the chance.' },
      { label: 'Take half: no Strasser — but a pact with the unions and the Christian workers for a crash programme of work creation.',
        eff: { unions: 10, legitimacy: 3, treasury: -2, inflation: 4, industry: -5, reichswehr: -2, policy: { works: 1 }, kpdMomentum: -0.08, nsMomentum: -0.06 },
        result: 'Leipart and Stegerwald\'s Christian unions sign a joint appeal. The winter relief works open in December. It is late — it is perhaps two years late — but the labour-exchange figures for January, for the first time since 1929, fall short of the forecast.' },
    ] },

  { id: 'finale', t: 18, speaker: 'puender', loc: [13.4, 52.52], place: 'Reich Chancellery · 30 January 1933', title: 'The Thirtieth of January',
    text: (st) => { const n = national(st.support); return [
      `Snow in the Wilhelmstraße. From your window you can see the garden wall of the Presidential Palace, and the sentries stamping their feet.`,
      `Four and a half years. ${st.stats.unemp > 26 ? 'Six million are still without work.' : st.stats.unemp > 18 ? 'The dole queues are shorter than a year ago, though no one would call them short.' : 'The factory whistles are sounding again in the north of the city.'} ${n.NSDAP >= 30 ? `One German in three would vote for Hitler tomorrow.` : n.NSDAP >= 18 ? `The National Socialists remain the strongest force on the right — but the tide that was supposed to carry them into this building has turned.` : `The brown tide that foreigners wrote such alarmed articles about has ebbed into the taverns it came from.`}`,
      `Pünder comes in without knocking, which he has never done. "${st.flags.republicanPresident ? 'The President asks whether you will take luncheon with him.' : hasMajority(st) ? 'The President\'s office telephoned. The Field Marshal wishes to receive you at eleven. No subject was given.' : 'Meissner telephoned. The Field Marshal wishes to receive you at eleven. Herr von Papen was seen entering by the garden gate an hour ago.'}"`,
      `You take your hat.`,
    ]; },
    choices: [
      { label: 'Cross the garden.', fn: (st) => { st.ended = finalEnding(st); return ''; } },
    ] },

  // ------------------------------------------------------------ conditional
  { id: 'kassenkrise', cond: true, cooldown: 3, when: (st) => st.stats.treasury <= -8, speaker: 'schacht', speakerFn: (st) => (st.t >= 7 ? 'luther' : 'schacht'),
    loc: [13.39, 52.515], place: 'Reichsbank', title: 'Kassenkrise',
    text: (st) => [
      `${st.t >= 7 ? 'Luther' : 'Schacht'} has kept you waiting eleven minutes in his own anteroom, which is a message in itself.`,
      `"The Reich cannot meet its salaries on the first of the month. You are ${Math.abs(st.stats.treasury).toFixed(1)} billions short, and the banks will not take another Treasury bill without my signature." He joins his fingertips. "I am prepared to help. I have conditions. You will not like them. But I gather, Herr Reichskanzler, that you have run out of things to like."`,
    ],
    choices: [
      { label: 'Accept his terms: a sinking fund, and cuts to salaries and benefits written by the Reichsbank.',
        eff: { treasury: 7, unions: -9, legitimacy: -4, industry: 5, hindenburg: 2, policy: { austerity: 1 }, kpdMomentum: 0.08 },
        result: 'The bridging credit is granted. The finance bill that passes cabinet next week was, in substance, dictated in the Jägerstraße. Your Finance Minister signs it as a man signs a confession.' },
      { label: 'Seek a bridging loan abroad — Lee Higginson in Boston, or the Banque de France.',
        req: (st) => st.stats.stability >= 42 && !st.flags.youngRejected && !st.flags.tradeWar, reqText: 'Requires public order 42 and good standing abroad',
        eff: { treasury: 7, legitimacy: -1, nsMomentum: 0.05, rel: { DNVP: -4 } },
        result: 'The Americans lend, at seven per cent and with a lecture. The nationalist press discovers that Germany is "pawned to Wall Street". The salaries are paid.' },
      { label: 'Impose an emergency levy on large fortunes and directors\' incomes.',
        eff: { treasury: 5, industry: -10, unions: 5, coalition: -6, rel: { DVP: -12, OTH: -6 }, policy: { taxes: 1 } },
        result: 'Capital, as the saying goes, is a shy deer. A good deal of it bolts for Zürich and Amsterdam before the decree is printed. What remains is taxed, and the first of the month is met.' },
      { label: 'Order the Reichsbank to discount Treasury bills directly. It is the state\'s bank.',
        eff: { treasury: 7, inflation: 14, legitimacy: -3, industry: -5, coalition: -5, rel: { DVP: -10, Z: -6, DDP: -5 } },
        result: 'The bank president protests in writing and leaks the letter. In the bakeries, old women count their change twice and talk about the year when a loaf cost a hundred billion marks.' },
    ] },

  { id: 'coalition_break', cond: true, cooldown: 3, when: (st) => st.stats.coalition <= 15 && st.gov.length > 1, speaker: 'puender', loc: [13.38, 52.52], place: 'Reichstag', title: 'The Coalition Breaks',
    text: (st) => { const p = inGov(st, 'DVP') ? 'the People\'s Party' : inGov(st, 'Z') ? 'Zentrum' : 'the Democrats'; return [
      `It ends, as these things do, over something small — a paragraph in a tax bill, a harsh word in committee. By evening ${p} has withdrawn its ministers.`,
      `"They have been looking for the door for months," Pünder says. "Tonight they found it." He has already done the sum on the back of an order paper.`,
    ]; },
    choices: [
      { label: 'Accept the resignations and govern on with what remains.',
        fn: (st) => {
          const p = inGov(st, 'DVP') ? 'DVP' : inGov(st, 'Z') ? 'Z' : 'DDP';
          st.gov = st.gov.filter((x) => x !== p); st.rel[p] -= 25; st.stats.coalition = 55; st.stats.hindenburg = Math.max(0, st.stats.hindenburg - 6);
          return hasMajority(st) ? `You still command ${govSeats(st)} of ${st.totalSeats} votes. A narrower government, and perhaps a more honest one.`
            : `You now command ${govSeats(st)} of ${st.totalSeats} votes. A minority government lives by the tolerance of its enemies — or by the favour of the President.`;
        } },
      { label: 'Pay what they ask. Offer a programme of budget cuts to keep them at the table.',
        eff: { coalition: 32, unions: -12, legitimacy: -3, policy: { austerity: 1 }, kpdMomentum: 0.1 },
        result: 'The ministers return to their desks. The price is entered in the budget, and at the labour exchanges.' },
    ] },

  { id: 'noconfidence', cond: true, cooldown: 2, when: (st) => !hasMajority(st) && !st.flags.konstruktiv && hostileSeats(st) > st.totalSeats / 2 && !st.electionPending,
    speaker: 'puender', loc: [13.38, 52.52], place: 'Reichstag', title: 'Motion of No Confidence',
    text: (st) => [
      `The Communists have tabled it; the National Socialists and the German Nationals will vote for it. Parties that would shoot each other in the street will walk through the same lobby to bring you down. Between them they have ${hostileSeats(st)} of ${st.totalSeats} seats.`,
      `"They can agree on nothing except your removal," says Pünder. "Unfortunately, under Article 54, that is all they need to agree on."`,
    ],
    choices: [
      { label: 'Ask the President for an order of dissolution, and fight an election.',
        req: (st) => (st.stats.hindenburg >= 42 || st.flags.republicanPresident) && st.t - st.lastElection >= 2, reqText: 'Requires the President\'s confidence (42), and no election in the last half-year',
        eff: { election: true, hindenburg: -4, legitimacy: -2 },
        result: 'You enter the chamber with the red folder under your arm. The order is read before the vote can be taken. The house disperses to the hustings — the cheapest and the most dangerous way out.' },
      { label: 'Buy toleration from the bourgeois centre with a programme of cuts.',
        req: (st) => st.rel.Z > -40, reqText: 'Zentrum must still be on speaking terms',
        eff: { rel: { Z: 30, DVP: 25, OTH: 25, DDP: 15 }, unions: -10, legitimacy: -3, policy: { austerity: 1 }, kpdMomentum: 0.08 },
        result: 'Enough deputies of the middle find urgent business elsewhere on the day of the vote. The motion fails. You remain Chancellor by the grace of men who are waiting for something better.' },
      { label: 'Face the vote, and go if it carries.',
        fn: (st) => { st.ended = successionEnding(st); return 'The motion carries. You do not wait for the President to ask.'; } },
    ] },

  { id: 'summons', cond: true, cooldown: 4, when: (st) => st.stats.hindenburg <= 28 && st.stats.hindenburg > 12 && !st.flags.republicanPresident && st.t >= 3,
    speaker: 'hindenburg', loc: [13.38, 52.515], place: 'Presidential Palace', title: 'Summoned',
    text: (st) => [
      `He receives you standing, which at his age is a kind of reproach. A block of a man, carved rather than born, speaking in the bass that commanded at Tannenberg.`,
      `"I am told things, Herr ${P(st)}. That my Chancellor governs with the unions against the economy. That the army is not at ease. That in the East, honest landowners are being left to ruin." He has it by heart; someone has rehearsed it with him. "I have sworn an oath to the constitution. I have sworn no oath to you."`,
    ],
    choices: [
      { label: 'Give way. Offer him aid for the eastern estates and a minister of his own choosing in the cabinet.',
        eff: { hindenburg: 16, treasury: -2, unions: -8, legitimacy: -3, coalition: -5, policy: { osthilfe: 1 } },
        result: 'A retired general without party affiliation takes over a ministry. The President is seen to nod at you at the next reception. Your Reichstag group asks, not quietly, who is governing Germany.' },
      { label: 'Appeal to the soldier: "Herr Feldmarschall, I ask only for the loyalty I have shown you."',
        req: (st) => st.stats.reichswehr >= 50, reqText: 'Requires Reichswehr loyalty 50',
        eff: { hindenburg: 9 },
        result: 'Something in the old man responds to the tone, if not to the argument. He dismisses you almost gently. Meissner, by the door, makes a note.' },
      { label: 'Stand on the constitution. You answer to the Reichstag.',
        eff: { hindenburg: -4, legitimacy: 3 },
        result: '"That will be all," says the President of the Republic.' },
    ] },

  { id: 'dismissal', cond: true, when: (st) => !st.flags.republicanPresident && (st.stats.hindenburg <= 12 || (st.stats.hindenburg <= 24 && !hasMajority(st) && st.t >= 7)),
    speaker: 'meissner', loc: [13.38, 52.515], place: 'Presidential Palace', title: 'The Red Folder',
    text: (st) => [
      `It is Meissner who tells you, in the anteroom, so that the President is spared the conversation.`,
      `"The Field Marshal thanks you for your services and regrets that he can no longer place the powers of his office at the disposal of your cabinet." ${hasMajority(st) ? 'You point out that you command a majority in the Reichstag. Meissner inclines his head. "The house can be dissolved, Herr Reichskanzler. The order is already signed."' : 'There is no majority to appeal to. There has not been for some time.'}`,
      `Through the tall doors you can hear a visitor being announced.`,
    ],
    choices: [{ label: 'Return the seals.', fn: (st) => { st.ended = successionEnding(st); return ''; } }] },

  { id: 'putsch', cond: true, cooldown: 6, when: (st) => st.t >= 8 && st.stats.reichswehr <= 20 && st.stats.stability <= 42, speaker: 'schleicher', loc: [13.36, 52.51], place: 'Bendlerstraße', title: 'The Army Speaks',
    text: () => [
      `There are armoured cars at the Brandenburg Gate. "Winter exercises," says the Reichswehr Ministry.`,
      `Schleicher arrives at the Chancellery in uniform, which he rarely wears. "The army can no longer guarantee order under the present conditions. The Chief of the Army Command and I ask the government to transfer executive power to the military district commanders. Temporarily." His charm is in its holster. "I should be sorry if it had to be done another way."`,
    ],
    choices: [
      { label: 'Call the unions. A general strike broke Kapp in four days.',
        fn: (st) => {
          if (st.stats.unions >= 50 && st.stats.reichsbanner >= 42) {
            st.stats.reichswehr = 46; st.stats.legitimacy = Math.min(100, st.stats.legitimacy + 10); st.stats.stability = Math.max(0, st.stats.stability - 8); st.stats.hindenburg -= 6;
            return 'No trains, no trams, no light, no water. The Reichsbanner occupies the ministries; the Prussian police does not move against it. On the third day Hammerstein informs the President that the Reichswehr "declines to fire on the people for the sake of General von Schleicher\'s career". The armoured cars go back to Döberitz.';
          }
          st.ended = 'general';
          return 'With six million unemployed outside the gates, who strikes? The call goes out; the answer is patchy, then silent. The Reichsbanner waits for orders that mean something. By nightfall there are sentries in field grey at your door.';
        } },
      { label: 'Yield. Make Schleicher Reichswehr Minister with emergency powers, and remain in office beside him.',
        eff: { reichswehr: 30, hindenburg: 8, legitimacy: -12, unions: -10, stability: 8, decree: 2, flags: { schleicherPower: true } },
        result: 'You are still Chancellor. The decrees are drafted in the Bendlerstraße now, and brought to you for signature in the afternoon.' },
    ] },

  { id: 'uprising', cond: true, cooldown: 6, when: (st) => st.stats.leftStreet >= 62 && st.stats.stability <= 30, speaker: 'severing', loc: [9.99, 53.55], place: 'Reich Interior Ministry', title: 'Barricades',
    text: () => [
      `Hamburg-Barmbek, Berlin-Wedding, the Mansfeld copper district: police stations stormed, barricades across the tram lines. Whether the Communist leadership ordered it or merely failed to prevent it, nobody in this building can say.`,
      `"The police can hold the city centres," Severing reports. "They cannot clear the quarters. The Reichswehr is offering to do it. General von Schleicher was <em>very</em> prompt with the offer."`,
    ],
    choices: [
      { label: 'Police only, and negotiate: amnesty for those who go home, emergency food relief for the districts.',
        eff: { stability: 6, leftStreet: -14, legitimacy: 2, hindenburg: -8, reichswehr: -6, treasury: -1 },
        result: 'It takes nine days and it is not glorious. But the dead number in dozens rather than thousands, and they are not laid at the door of the army.' },
      { label: 'Send in the Reichswehr.',
        eff: { stability: 12, leftStreet: -30, legitimacy: -8, reichswehr: 10, hindenburg: 6, unions: -10, kpdMomentum: 0.2, decree: 1 },
        result: 'Mortars in Wedding. The rising is over in forty-eight hours. Your party will be answering for those forty-eight hours for the next forty years.' },
    ] },
];

export const EVENT_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

/** Events that should fire at the start of the current turn. */
export function eventsForTurn(state) {
  const out = [];
  for (const e of EVENTS) {
    if (e.cond) {
      if ((state.cooldown['ev_' + e.id] || 0) > 0) continue;
      if (e.when(state)) out.push(e);
    } else if (e.t === state.t && !state.done[e.id] && (!e.when || e.when(state))) out.push(e);
  }
  // Dismissal pre-empts everything else.
  const d = out.find((e) => e.id === 'dismissal');
  return d ? [d] : out.sort((a, b) => (a.cond ? 1 : 0) - (b.cond ? 1 : 0));
}

// ---- Endings -------------------------------------------------------------
export const ENDINGS = {
  social_republic: { tone: 'good', title: 'Die Soziale Republik', sub: 'The Social Republic',
    text: (st) => [
      `The luncheon is short. The President wishes to discuss the budget for 1934.`,
      `There was no day on which the Republic was saved. There was only a succession of days on which it was not lost: a vote carried by nineteen, a bank that reopened, a decree that was signed and a decree that was refused, a million men handed shovels instead of leaflets. Unemployment stands at ${st.stats.unemp.toFixed(0)} per cent and falling. In the spring the Reichstag — a Reichstag that still meets, still shouts, still votes — will debate whether the work-creation credits should be wound down or made permanent.`,
      `Abroad they are calling it the German experiment and sending professors to study it. At home the party of the Bohemian corporal holds its rallies in smaller halls each month, and argues about money.`,
      `You were never loved. Democratic chancellors seldom are. But on the eleventh of August, Constitution Day, the black-red-gold flag will be raised over a state that has survived its worst enemy — the indifference of its own citizens — and you will stand beneath it, and it will not occur to anyone that it could have been otherwise.`,
    ] },
  republic: { tone: 'good', title: 'Die Republik lebt', sub: 'The Republic Lives',
    text: (st) => [
      `It is nothing. A matter of protocol; a signature. You are back at your desk by noon.`,
      `The Republic that enters its fifteenth year is poorer, harder and more tired than the one you were handed. ${st.stats.unemp > 22 ? 'Millions are still out of work, and the recovery, when it comes, will owe more to the world market than to anything decided in this building.' : 'The worst of the slump is behind it.'} But the Reichstag sits. The courts judge. Newspapers print what they like about you, most of it unkind.`,
      `In Munich, the man who was to have been carried to power by the crisis is reported to be quarrelling with his creditors. History will record that the National Socialist wave broke in 1932 — and will find it obvious, in retrospect, that it had to.`,
      `Only those who were in the room will know how little was obvious.`,
    ] },
  fortress: { tone: 'grey', title: 'Die wehrhafte Republik', sub: 'The Republic Under Arms',
    text: (st) => [
      `The audience is correct, and brief. You are confirmed in office. Another emergency decree is signed.`,
      `You have held. The swastika does not fly over the Chancellery, and the men who meant to hoist it are ${st.flags.saBanned ? 'banned, watched and bickering' : 'further from power than they were a year ago'}. But ask by what means you have held, and the answer is a list of paragraphs: Article 48, the Law for the Protection of the Republic, police ordinances, suspended newspapers. The Reichstag has become a place where your decrees are not quite overturned.`,
      `Perhaps this is what survival looks like — a democracy that defended itself with the tools to hand, and will lay them down when the danger has passed. Perhaps it is only a slower road to the same destination, with a more respectable class of passenger.`,
      `You have bought time. You tell yourself that time is the only thing a democracy ever really needs.`,
    ] },
  abyss: { tone: 'grey', title: 'Am Abgrund', sub: 'At the Edge',
    text: (st) => [
      `You come back across the garden still Chancellor of the German Reich. For today.`,
      `Every instrument of power is still in your hands, and every one of them is trembling. ${national(st.support).NSDAP >= 30 ? 'A third of the nation waits for a redeemer.' : 'The people have stopped believing that anything decided in Berlin can touch their lives.'} The generals are polite. The President is very old. In the Herrenklub and the Kaiserhof, combinations are being tried out like keys on a lock.`,
      `You have not lost. That is all that can be said, and in January 1933 it is not nothing. Somewhere a version of this winter exists in which the lock gave way.`,
      `Whether the Republic outlives the year will be decided by the next mistake — yours, or theirs.`,
    ] },
  machtergreifung: { tone: 'bad', title: 'Der 30. Januar', sub: 'The Thirtieth of January',
    text: (st) => [
      `${st.t >= 18 ? 'The audience lasts four minutes.' : 'It does not happen at once. There is an interlude of barons and generals, each certain he can use the brown movement for his own ends.'} Then, on a winter morning, the President of the German Reich receives the leader of its largest party, and swears him in as Chancellor.`,
      `"We have hired him," Herr von Papen assures his friends. "In two months we will have pushed Hitler so far into the corner that he squeaks."`,
      `That night twenty-five thousand torches pass through the Brandenburg Gate. Within a month the Reichstag burns. Within two, your party is the only one to vote against the Enabling Act, with the SA lining the walls of the chamber. Otto Wels speaks the last free words: <em>Freedom and life can be taken from us, but not honour.</em>`,
      `You hear of it in Prague, from a newspaper. The Republic you served for four and a half years lasted fourteen. What comes after will last twelve, and will cost fifty million lives.`,
    ] },
  general: { tone: 'bad', title: 'Der General', sub: 'The General',
    text: () => [
      `There is no torchlight parade. There is a communiqué.`,
      `General von Schleicher forms a "cabinet of national concentration" responsible to the President alone. The Reichstag is dissolved and no date is set for elections. The parties are not banned; they are simply left with nothing to do. The SA is absorbed into a state militia, the unions into a "labour front" under army patronage, and both discover that they have been disarmed.`,
      `It is not the Third Reich. There are no camps on the moors — only fortress confinement for the stubborn, and a censor who is an educated man. Abroad, they are rather relieved. Germany has a government of gentlemen again.`,
      `You are permitted to retire to the country and write your memoirs, subject to review. The Republic of Weimar is not overthrown. It is, as the General might put it, stood down.`,
    ] },
  herrenklub: { tone: 'bad', title: 'Das Kabinett der Barone', sub: 'The Cabinet of Barons',
    text: () => [
      `Your successor is a gentleman rider with excellent manners and no following whatever. His cabinet contains seven noblemen and not one man who could win a constituency.`,
      `They govern by decree, dissolve the Reichstag whenever it threatens to meet, and speak of a "New State" in which parliament advises and the President — or perhaps, in time, a regent — decides. The constitution is not abolished. It is reinterpreted.`,
      `You kept the National Socialists small enough that the barons do not need them. That is your achievement, and it is not a small one: the worst has been averted. But the first German democracy ends all the same — not with a bang, as a poet in London has it, but with an ordinance.`,
    ] },
  resigned: { tone: 'grey', title: 'Wie es geschah', sub: 'As It Happened',
    text: () => [
      `You were the last Chancellor of the Weimar Republic to govern with a parliamentary majority.`,
      `Three days after your resignation, Heinrich Brüning forms a cabinet "not bound to any coalition". When the Reichstag rejects his budget, he enacts it by presidential decree and dissolves the house. In the election of September 1930 the National Socialists rise from twelve seats to one hundred and seven.`,
      `Your party will "tolerate" Brüning for two years as the lesser evil, then watch as Papen deposes its Prussian government with a lieutenant and ten men. On the thirtieth of January 1933, Hindenburg appoints Adolf Hitler Chancellor of the Reich.`,
      `For the rest of their lives, the men who voted in the party room that afternoon in March 1930 will ask themselves whether a quarter of one per cent was worth it.`,
    ] },
  president_hitler: { tone: 'bad', title: 'Reichspräsident Hitler', sub: 'President Hitler',
    text: () => [
      `He does not need to be appointed by anyone. He has been elected.`,
      `Article 48 — the emergency powers, command of the Reichswehr, the right to appoint and dismiss the Chancellor, the right to dissolve the Reichstag — passes on the day of his inauguration into the hands of the man who promised that heads would roll.`,
      `You are dismissed before the week is out. There is no need for an Enabling Act. The constitution of Weimar, its fathers were proud to say, was the freest in the world. It placed great trust in whoever the people might choose.`,
    ] },
};
