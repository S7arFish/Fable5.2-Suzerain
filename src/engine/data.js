// Static world data: parties, regions, geography, characters.

export const PARTY_ORDER = ['KPD', 'SPD', 'DDP', 'Z', 'DVP', 'OTH', 'DNVP', 'NSDAP'];

export const PARTIES = {
  KPD: { name: 'KPD', full: 'Kommunistische Partei Deutschlands', color: '#9b1b1b', blurb: 'Moscow-aligned communists. They call you a "social fascist".' },
  SPD: { name: 'SPD', full: 'Sozialdemokratische Partei Deutschlands', color: '#e0503a', blurb: 'Your party. The largest pillar of the Republic.' },
  DDP: { name: 'DDP', full: 'Deutsche Demokratische Partei', color: '#e2b23c', blurb: 'Left-liberals. Loyal republicans with a shrinking electorate.' },
  Z: { name: 'Zentrum', full: 'Zentrum & Bayerische Volkspartei', color: '#8b98a8', blurb: 'Political Catholicism. Indispensable to every majority.' },
  DVP: { name: 'DVP', full: 'Deutsche Volkspartei', color: '#3f93a6', blurb: 'National liberals, the voice of heavy industry.' },
  OTH: { name: 'Others', full: 'Wirtschaftspartei, Landvolk & splinter lists', color: '#a79d8a', blurb: 'Middle-class interest parties. Adrift, and easily radicalised.' },
  DNVP: { name: 'DNVP', full: 'Deutschnationale Volkspartei', color: '#3c63b0', blurb: 'Monarchist nationalists under the press baron Hugenberg.' },
  NSDAP: { name: 'NSDAP', full: 'Nationalsozialistische Deutsche Arbeiterpartei', color: '#8a5a2b', blurb: 'Hitler\'s movement. A fringe sect in 1928. For now.' },
};

// National result of the Reichstag election of 20 May 1928 (percent).
export const NATIONAL_1928 = { KPD: 10.6, SPD: 29.8, DDP: 4.9, Z: 15.2, DVP: 8.7, OTH: 14.0, DNVP: 14.2, NSDAP: 2.6 };
export const SEATS_1928 = { KPD: 54, SPD: 153, DDP: 25, Z: 78, DVP: 45, OTH: 51, DNVP: 73, NSDAP: 12 };

// ---- Geography -----------------------------------------------------------
// Hand-authored border vertices [lon, lat]; regions share vertices so borders align.
export const P = {
  // North Sea coast
  nl1: [7.2, 53.24], ns1: [7.02, 53.45], ns2: [7.1, 53.68], ns3: [7.75, 53.72], ns4: [8.05, 53.68], ns5: [8.15, 53.5],
  ns6: [8.32, 53.42], ns7: [8.3, 53.62], ns8: [8.55, 53.55], ns9: [8.58, 53.85], ns10: [8.72, 53.88],
  elbe1: [9.05, 53.86], elbe2: [9.5, 53.7], elbe3: [9.95, 53.52], elbe4: [10.3, 53.42], elbe5: [10.55, 53.37],
  elbe5b: [11.0, 53.22], elbe6: [11.3, 53.12], elbe7: [11.55, 53.03],
  sh1: [8.88, 54.03], sh2: [8.85, 54.13], sh3: [8.62, 54.32], sh4: [8.95, 54.47], sh5: [8.75, 54.72],
  dk1: [8.66, 54.91], dk2: [9.05, 54.87], dk3: [9.42, 54.82],
  // Baltic coast
  b1: [9.95, 54.78], b2: [10.03, 54.5], b3: [10.2, 54.42], b4: [10.7, 54.33], b5: [11.1, 54.4], b6: [11.05, 54.18],
  b7: [10.8, 54.05], b8: [10.9, 53.96], m1: [11.45, 53.93], m2: [11.7, 54.12], m3: [12.1, 54.18], m4: [12.35, 54.3],
  p1: [12.5, 54.47], p2: [12.95, 54.44], p3: [13.1, 54.32], p3a: [13.15, 54.55], p3b: [13.42, 54.68], p3c: [13.68, 54.55],
  p3d: [13.72, 54.3], p4: [13.45, 54.12], p5: [13.8, 54.12], p6: [14.25, 53.93], p7: [14.75, 54.02], p8: [15.57, 54.18],
  p9: [16.2, 54.3], p10: [16.85, 54.59], p11: [17.55, 54.76], p12: [18.05, 54.82],
  // Polish corridor / eastern border
  c1: [18.0, 54.6], c2: [17.85, 54.3], c3: [17.45, 53.95], c4: [17.45, 53.7], c5: [17.2, 53.42], c6: [17.05, 53.2],
  c7: [16.85, 53.05], c8: [16.4, 52.98], c9: [15.95, 52.92],
  e1: [15.85, 52.62], e2: [15.78, 52.35], e3: [15.9, 52.12], bse: [15.95, 52.0],
  s1: [16.15, 51.95], s2: [16.42, 51.86], s3: [16.68, 51.66], s4: [16.85, 51.52], s5: [17.3, 51.62], s6: [17.8, 51.42],
  s7: [18.05, 51.25], s8: [18.25, 51.05], s9: [18.62, 50.85], s10: [18.55, 50.6], s11: [18.98, 50.4], s12: [18.85, 50.28],
  s13: [18.6, 50.18], s14: [18.4, 50.0], s15: [18.3, 49.93],
  // Czechoslovak border
  cz1: [18.0, 49.98], cz2: [17.75, 50.1], cz3: [17.6, 50.27], cz4: [17.25, 50.33], cz5: [16.95, 50.42], cz6: [16.98, 50.22],
  cz7: [16.72, 50.1], cz8: [16.35, 50.38], cz9: [16.3, 50.62], cz10: [15.95, 50.68], cz11: [15.6, 50.78], cz12: [15.25, 50.92],
  cz13: [14.98, 51.0], cz14: [14.82, 50.87], cz15: [14.6, 50.95], cz16: [14.45, 51.03], cz17: [14.25, 50.9], cz18: [13.85, 50.73],
  cz19: [13.45, 50.62], cz20: [13.0, 50.42], cz21: [12.5, 50.35], cz22: [12.32, 50.2], cz23: [12.1, 50.32],
  by1: [12.15, 50.2], by2: [12.28, 50.06], by3: [12.52, 49.93], by4: [12.4, 49.75], by5: [12.6, 49.52], by6: [12.9, 49.33],
  by7: [13.25, 49.12], by8: [13.83, 48.77],
  // Austrian border
  at1: [13.72, 48.52], at2: [13.43, 48.42], at3: [13.02, 48.26], at4: [12.9, 48.0], at5: [13.0, 47.85], at6: [13.08, 47.65],
  at7: [13.02, 47.47], at8: [12.78, 47.58], at9: [12.72, 47.7], at10: [12.2, 47.62], at11: [11.63, 47.58], at12: [11.25, 47.4],
  at13: [10.9, 47.45], at14: [10.45, 47.57], at15: [10.25, 47.28], at16: [10.1, 47.38], at17: [9.97, 47.54], at18: [9.72, 47.54],
  bo1: [9.6, 47.6], bo2: [9.4, 47.68], bo3: [9.18, 47.66],
  ch1: [8.9, 47.7], ch2: [8.72, 47.8], ch3: [8.42, 47.68], ch4: [8.2, 47.62], ch5: [7.95, 47.56], ch6: [7.6, 47.58],
  rh1: [7.52, 47.85], rh2: [7.58, 48.1], rh3: [7.75, 48.4], rh4: [7.82, 48.62], rh5: [8.1, 48.85], rh6: [8.22, 48.97],
  fr1: [7.95, 49.04], fr2: [7.6, 49.06], fr3: [7.38, 49.15], fr4: [7.05, 49.12], fr5: [6.75, 49.17], fr6: [6.58, 49.28], fr7: [6.52, 49.44],
  lx1: [6.37, 49.47], lx2: [6.52, 49.8], lx3: [6.25, 49.88], lx4: [6.13, 50.13],
  be1: [6.3, 50.3], be2: [6.4, 50.45], be3: [6.18, 50.55], be4: [6.02, 50.75],
  nlA: [6.02, 50.76], nlB: [6.08, 50.92], nlC: [5.9, 51.05], nlD: [6.15, 51.17], nlE: [6.22, 51.45], nlF: [5.98, 51.75],
  nlG: [6.1, 51.87], nlH: [6.4, 51.86], nlI: [6.75, 51.92], nlJ: [6.83, 52.12], nlK: [7.06, 52.24], nlL: [6.75, 52.45],
  nlM: [6.72, 52.63], nlN: [7.05, 52.64], nlO: [7.2, 52.95],
  // East Prussia
  op1: [19.4, 54.37], op2: [19.9, 54.66], op3: [19.95, 54.95], op4: [20.5, 54.96], op5: [21.0, 54.92], op6: [21.25, 55.25],
  op7: [21.9, 55.08], op8: [22.6, 55.06], op9: [22.78, 54.65], op10: [22.8, 54.37], op11: [22.6, 53.95], op12: [22.45, 53.68],
  op13: [21.95, 53.5], op14: [21.0, 53.35], op15: [20.6, 53.3], op16: [20.2, 53.36], op17: [19.85, 53.5], op18: [19.5, 53.52],
  op19: [19.2, 53.55], op20: [18.92, 53.62], op21: [18.85, 53.85], op22: [18.98, 54.03], op23: [19.22, 54.25],
  // Interior junctions and borders
  shm1: [10.85, 53.55], shm2: [10.92, 53.8],
  mb1: [11.9, 53.3], mb2: [12.6, 53.22], mb3: [13.2, 53.15], mb4: [13.6, 53.4], mpb: [13.85, 53.5],
  mp1: [12.75, 54.05], mp2: [13.05, 53.85], mp3: [13.4, 53.7],
  pb1: [14.25, 53.3], pb2: [14.4, 53.12], pb3: [14.9, 53.02], pb4: [15.3, 53.25], pb5: [15.7, 53.22],
  hp1: [10.85, 52.85], hp2: [10.95, 52.35], hp3: [11.05, 52.1], hp4: [10.65, 51.9], jHPT: [10.5, 51.55],
  bp1: [12.05, 52.85], bp2: [12.22, 52.5], bp3: [12.2, 52.2], bp4: [12.55, 52.0], bp5: [13.2, 51.8], jBPS: [13.5, 51.42],
  jBSS: [13.95, 51.4], bs1: [14.6, 51.55], bs2: [15.2, 51.8], bs3: [15.7, 52.05], ss1: [14.55, 51.3],
  sp1: [13.15, 51.45], sp2: [12.7, 51.45], sp3: [12.25, 51.45], jSPT: [12.2, 51.2],
  st1: [12.55, 51.02], st2: [12.3, 50.78], st3: [12.22, 50.6], st4: [11.95, 50.55], jSTB: [11.9, 50.42],
  tp1: [11.6, 51.15], tp2: [11.1, 51.38], ht1: [10.2, 51.45], jHHT: [9.95, 51.38],
  th1: [10.15, 51.15], th2: [9.98, 50.95], th3: [10.05, 50.65], jHTB: [10.1, 50.52],
  tb1: [10.4, 50.4], tb2: [10.85, 50.4], tb3: [11.15, 50.3], tb4: [11.45, 50.48], tb5: [11.65, 50.38],
  hb1: [9.75, 50.42], hb2: [9.5, 50.23], hb3: [9.05, 50.1], hb4: [9.02, 49.85], jHBB: [9.1, 49.6],
  hbd1: [8.92, 49.45], hbd2: [8.65, 49.58], jHBP: [8.4, 49.58], hpf1: [8.1, 49.65], jRHP: [7.85, 49.85],
  hr1: [7.78, 50.05], hr2: [7.72, 50.28], hr3: [7.8, 50.5], hr4: [7.95, 50.65], jRWH: [8.12, 50.7],
  rw1: [6.8, 51.68], rw2: [6.98, 51.5], rw3: [7.12, 51.4], rw4: [7.3, 51.3], rw5: [7.5, 51.18], rw6: [7.72, 51.02], rw7: [7.92, 50.85],
  wh1: [8.35, 50.88], wh2: [8.55, 51.1], wh3: [8.72, 51.27], wh4: [8.95, 51.42], jHWH: [9.4, 51.62], hh1: [9.62, 51.35],
  hw1: [9.42, 51.8], hw2: [9.2, 52.05], hw3: [9.02, 52.25], hw4: [9.05, 52.48], hw5: [8.5, 52.5], hw6: [8.42, 52.3],
  hw7: [8.35, 52.1], hw8: [8.0, 52.08], hw9: [7.9, 52.32], hw10: [7.6, 52.45], hw11: [7.25, 52.32],
  bw1: [9.1, 47.95], bw2: [8.65, 48.0], bw3: [8.5, 48.22], bw4: [8.3, 48.48], bw5: [8.45, 48.75], bw6: [8.85, 48.9],
  bw7: [8.95, 49.12], bw8: [9.3, 49.3], bw9: [9.6, 49.42], jBWB: [9.85, 49.58], bb1: [9.55, 49.78],
  wb1: [10.1, 47.7], wb2: [10.12, 48.0], wb3: [10.0, 48.4], wb4: [10.3, 48.65], wb5: [10.42, 48.95], wb6: [10.15, 49.2], wb7: [10.1, 49.45],
  bpf1: [8.45, 49.3], ps1: [7.4, 49.35], jRPS: [7.4, 49.52], pr1: [7.6, 49.7], sr1: [7.1, 49.6], sr2: [6.65, 49.55],
  // Berlin
  be_a: [13.1, 52.4], be_b: [13.25, 52.62], be_c: [13.5, 52.67], be_d: [13.75, 52.52], be_e: [13.7, 52.38], be_f: [13.4, 52.35],
};

const seq = (prefix, a, b) => { const out = []; const step = a <= b ? 1 : -1; for (let i = a; i !== b + step; i += step) out.push(prefix + i); return out; };

// pop: share of the national electorate (%). urban / cath / agr: 0..1 social profile.
export const REGIONS = [
  { id: 'OPR', name: 'Ostpreußen', en: 'East Prussia', seat: 'Königsberg', pop: 3.6, urban: 0.25, cath: 0.15, agr: 0.8,
    base: { KPD: 9, SPD: 27, DDP: 4, Z: 7, DVP: 10, OTH: 11, DNVP: 31, NSDAP: 1 },
    note: 'Cut off from the Reich by the Polish Corridor. Junker estates, deep in debt, and Hindenburg\'s own Neudeck.',
    rings: [seq('op', 1, 23)], label: [21.0, 54.2] },
  { id: 'POM', name: 'Pommern', en: 'Pomerania', seat: 'Stettin', pop: 3.0, urban: 0.25, cath: 0.03, agr: 0.8,
    base: { KPD: 6, SPD: 30, DDP: 4, Z: 1, DVP: 5, OTH: 11.5, DNVP: 41, NSDAP: 1.5 },
    note: 'Protestant, agrarian and conservative. The heartland of the German Nationals.',
    rings: [['m4', 'p1', 'p2', 'p3', 'p3a', 'p3b', 'p3c', 'p3d', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', ...seq('c', 1, 9), 'pb5', 'pb4', 'pb3', 'pb2', 'pb1', 'mpb', 'mp3', 'mp2', 'mp1']], label: [15.9, 53.72] },
  { id: 'SHH', name: 'Nordmark', en: 'Schleswig-Holstein & Hamburg', seat: 'Hamburg', pop: 4.3, urban: 0.6, cath: 0.03, agr: 0.4,
    base: { KPD: 12, SPD: 36, DDP: 8, Z: 1, DVP: 13, OTH: 9.5, DNVP: 17, NSDAP: 3.5 },
    note: 'Red Hamburg and its docks, ringed by a Protestant peasantry already flying the black flag of the Landvolk.',
    rings: [['elbe1', ...seq('sh', 1, 5), 'dk1', 'dk2', 'dk3', ...seq('b', 1, 8), 'shm2', 'shm1', 'elbe5', 'elbe4', 'elbe3', 'elbe2']], label: [9.75, 54.2] },
  { id: 'MEC', name: 'Mecklenburg', en: 'Mecklenburg', seat: 'Schwerin', pop: 1.4, urban: 0.3, cath: 0.03, agr: 0.75,
    base: { KPD: 6, SPD: 40, DDP: 4, Z: 1, DVP: 9, OTH: 12, DNVP: 26, NSDAP: 2 },
    note: 'Great estates and landless labourers. Sparsely peopled, politically brittle.',
    rings: [['b8', 'm1', 'm2', 'm3', 'm4', 'mp1', 'mp2', 'mp3', 'mpb', 'mb4', 'mb3', 'mb2', 'mb1', 'elbe6', 'elbe5b', 'elbe5', 'shm1', 'shm2']], label: [12.2, 53.68] },
  { id: 'BRA', name: 'Brandenburg', en: 'Brandenburg', seat: 'Potsdam', pop: 4.2, urban: 0.4, cath: 0.05, agr: 0.55,
    base: { KPD: 9, SPD: 33, DDP: 5, Z: 2, DVP: 9, OTH: 16.5, DNVP: 24, NSDAP: 1.5 },
    note: 'The Prussian core: garrison towns, sandy farms, and the long shadow of Potsdam.',
    rings: [['elbe6', 'mb1', 'mb2', 'mb3', 'mb4', 'mpb', 'pb1', 'pb2', 'pb3', 'pb4', 'pb5', 'c9', 'e1', 'e2', 'e3', 'bse', 'bs3', 'bs2', 'bs1', 'jBSS', 'jBPS', 'bp5', 'bp4', 'bp3', 'bp2', 'bp1', 'elbe7']],
    holes: [['be_a', 'be_b', 'be_c', 'be_d', 'be_e', 'be_f']], label: [14.45, 52.28] },
  { id: 'BER', name: 'Berlin', en: 'Berlin', seat: 'Berlin', pop: 6.8, urban: 1, cath: 0.1, agr: 0,
    base: { KPD: 25, SPD: 34, DDP: 8, Z: 4, DVP: 6, OTH: 4.5, DNVP: 17, NSDAP: 1.5 },
    note: 'World city of four million. Capital of the Republic, and the Communists\' strongest fortress.',
    rings: [['be_a', 'be_b', 'be_c', 'be_d', 'be_e', 'be_f']], label: [13.42, 52.52], small: true },
  { id: 'SIL', name: 'Schlesien', en: 'Silesia', seat: 'Breslau', pop: 7.2, urban: 0.5, cath: 0.5, agr: 0.45,
    base: { KPD: 6, SPD: 32, DDP: 3, Z: 22, DVP: 5, OTH: 10.5, DNVP: 20, NSDAP: 1.5 },
    note: 'Catholic coalfields in the south-east, Protestant estates in the north. A border province that feels robbed.',
    rings: [['jBSS', 'bs1', 'bs2', 'bs3', 'bse', ...seq('s', 1, 15), ...seq('cz', 1, 13), 'ss1']], label: [16.6, 51.05] },
  { id: 'SAX', name: 'Sachsen', en: 'Saxony', seat: 'Dresden', pop: 8.0, urban: 0.75, cath: 0.04, agr: 0.2,
    base: { KPD: 15, SPD: 36, DDP: 6, Z: 1, DVP: 12, OTH: 18, DNVP: 9, NSDAP: 3 },
    note: 'The most industrialised Land in Germany: textile towns, small workshops, and a ruined lower middle class.',
    rings: [['jBPS', 'jBSS', 'ss1', ...seq('cz', 13, 23), 'jSTB', 'st4', 'st3', 'st2', 'st1', 'jSPT', 'sp3', 'sp2', 'sp1']], label: [13.3, 51.02] },
  { id: 'THU', name: 'Thüringen', en: 'Thuringia', seat: 'Weimar', pop: 3.6, urban: 0.5, cath: 0.1, agr: 0.4,
    base: { KPD: 14, SPD: 33, DDP: 4, Z: 4, DVP: 10, OTH: 22.5, DNVP: 9, NSDAP: 3.5 },
    note: 'The Republic was founded here, in Weimar. Its Landtag is now the laboratory of the völkisch right.',
    rings: [['jSPT', 'st1', 'st2', 'st3', 'st4', 'jSTB', 'tb5', 'tb4', 'tb3', 'tb2', 'tb1', 'jHTB', 'th3', 'th2', 'th1', 'jHHT', 'ht1', 'jHPT', 'tp2', 'tp1']], label: [11.0, 50.82] },
  { id: 'PSA', name: 'Mitteldeutschland', en: 'Prussian Saxony & Anhalt', seat: 'Magdeburg', pop: 5.5, urban: 0.55, cath: 0.06, agr: 0.45,
    base: { KPD: 12, SPD: 40, DDP: 5, Z: 2, DVP: 10, OTH: 12, DNVP: 17, NSDAP: 2 },
    note: 'Lignite, chemicals and sugar beet. Magdeburg is the home of the Reichsbanner.',
    rings: [['elbe7', 'bp1', 'bp2', 'bp3', 'bp4', 'bp5', 'jBPS', 'sp1', 'sp2', 'sp3', 'jSPT', 'tp1', 'tp2', 'jHPT', 'hp4', 'hp3', 'hp2', 'hp1']], label: [11.75, 51.95] },
  { id: 'HAN', name: 'Niedersachsen', en: 'Hanover & Lower Saxony', seat: 'Hannover', pop: 8.5, urban: 0.45, cath: 0.15, agr: 0.55,
    base: { KPD: 5, SPD: 36, DDP: 6, Z: 8, DVP: 11, OTH: 19.5, DNVP: 10, NSDAP: 4.5 },
    note: 'Guelph loyalists, heath farmers and port cities. The peasant protest here has no fixed address yet.',
    rings: [['nl1', ...seq('ns', 1, 10), 'elbe1', 'elbe2', 'elbe3', 'elbe4', 'elbe5', 'elbe5b', 'elbe6', 'elbe7', 'hp1', 'hp2', 'hp3', 'hp4', 'jHPT', 'ht1', 'jHHT', 'hh1', 'jHWH', ...seq('hw', 1, 11), 'nlK', 'nlL', 'nlM', 'nlN', 'nlO']], label: [9.3, 52.82] },
  { id: 'WES', name: 'Westfalen', en: 'Westphalia', seat: 'Münster', pop: 7.8, urban: 0.7, cath: 0.5, agr: 0.3,
    base: { KPD: 11, SPD: 28, DDP: 3, Z: 29, DVP: 9, OTH: 10.5, DNVP: 8, NSDAP: 1.5 },
    note: 'The eastern Ruhr and the Catholic Münsterland. Pit villages where priest and union secretary share the pulpit.',
    rings: [['nlK', ...seq('hw', 11, 1), 'jHWH', 'wh4', 'wh3', 'wh2', 'wh1', 'jRWH', ...seq('rw', 7, 1), 'nlH', 'nlI', 'nlJ']], label: [8.05, 51.68] },
  { id: 'RHL', name: 'Rheinland', en: 'Rhineland', seat: 'Köln', pop: 11.5, urban: 0.75, cath: 0.68, agr: 0.2,
    base: { KPD: 14, SPD: 19, DDP: 3, Z: 33, DVP: 9, OTH: 11.5, DNVP: 9, NSDAP: 1.5 },
    note: 'Coal, steel and cathedral spires. Still partly under Allied occupation, and the fortress of the Zentrum.',
    rings: [['nlH', ...seq('rw', 1, 7), 'jRWH', 'hr4', 'hr3', 'hr2', 'hr1', 'jRHP', 'pr1', 'jRPS', 'sr1', 'sr2', 'fr7', 'lx1', 'lx2', 'lx3', 'lx4', 'be1', 'be2', 'be3', 'be4', 'nlA', 'nlB', 'nlC', 'nlD', 'nlE', 'nlF', 'nlG']], label: [6.85, 50.55] },
  { id: 'HES', name: 'Hessen', en: 'Hesse', seat: 'Frankfurt', pop: 5.6, urban: 0.55, cath: 0.3, agr: 0.4,
    base: { KPD: 9, SPD: 34, DDP: 6, Z: 14, DVP: 11, OTH: 14, DNVP: 9, NSDAP: 3 },
    note: 'Frankfurt\'s banks and liberal press; in the hills, poor smallholders with long memories of antisemitic agitation.',
    rings: [['jHWH', 'hh1', 'jHHT', 'th1', 'th2', 'th3', 'jHTB', 'hb1', 'hb2', 'hb3', 'hb4', 'jHBB', 'hbd1', 'hbd2', 'jHBP', 'hpf1', 'jRHP', 'hr1', 'hr2', 'hr3', 'hr4', 'jRWH', 'wh1', 'wh2', 'wh3', 'wh4']], label: [9.0, 50.62] },
  { id: 'BAD', name: 'Baden', en: 'Baden', seat: 'Karlsruhe', pop: 3.7, urban: 0.45, cath: 0.58, agr: 0.45,
    base: { KPD: 7, SPD: 22, DDP: 7, Z: 33, DVP: 9, OTH: 11, DNVP: 8, NSDAP: 3 },
    note: 'The "model Land" of German liberalism, governed by the Weimar parties without interruption since 1919.',
    rings: [['jHBP', 'hbd2', 'hbd1', 'jHBB', 'bb1', 'jBWB', ...seq('bw', 9, 1), 'bo2', 'bo3', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', ...seq('rh', 1, 6), 'bpf1']], label: [8.12, 48.3] },
  { id: 'WUR', name: 'Württemberg', en: 'Württemberg', seat: 'Stuttgart', pop: 4.2, urban: 0.45, cath: 0.32, agr: 0.5,
    base: { KPD: 7, SPD: 24, DDP: 10, Z: 20, DVP: 5, OTH: 26, DNVP: 6, NSDAP: 2 },
    note: 'Thrifty, pietist, export-minded. Unemployment bites later here than anywhere else in the Reich.',
    rings: [['jBWB', ...seq('wb', 7, 1), 'bo1', 'bo2', ...seq('bw', 1, 9)]], label: [9.45, 48.55] },
  { id: 'BAY', name: 'Bayern', en: 'Bavaria', seat: 'München', pop: 12.0, urban: 0.4, cath: 0.7, agr: 0.55,
    base: { KPD: 4, SPD: 24, DDP: 3, Z: 31, DVP: 4, OTH: 18, DNVP: 9.5, NSDAP: 6.5 },
    note: 'The white-and-blue Free State, jealous of its rights. Munich gave the Nazis their cradle; Protestant Franconia gives them votes.',
    rings: [
      ['jHTB', ...seq('tb', 1, 5), 'jSTB', 'cz23', ...seq('by', 1, 8), ...seq('at', 1, 18), 'bo1', ...seq('wb', 1, 7), 'jBWB', 'bb1', 'jHBB', 'hb4', 'hb3', 'hb2', 'hb1'],
      ['jRHP', 'hpf1', 'jHBP', 'bpf1', 'rh6', 'fr1', 'fr2', 'fr3', 'ps1', 'jRPS', 'pr1'],
    ], label: [11.75, 48.85] },
];

export const SAAR = { id: 'SAAR', name: 'Saargebiet', ring: ['jRPS', 'ps1', 'fr3', 'fr4', 'fr5', 'fr6', 'fr7', 'sr2', 'sr1'], label: [6.95, 49.36] };

export const CITIES = [
  { n: 'Berlin', at: [13.4, 52.52], cap: true }, { n: 'Hamburg', at: [9.99, 53.55] }, { n: 'München', at: [11.58, 48.14] },
  { n: 'Köln', at: [6.96, 50.94] }, { n: 'Leipzig', at: [12.37, 51.34] }, { n: 'Dresden', at: [13.74, 51.05] },
  { n: 'Breslau', at: [17.03, 51.11] }, { n: 'Essen', at: [7.01, 51.45] }, { n: 'Frankfurt', at: [8.68, 50.11] },
  { n: 'Stuttgart', at: [9.18, 48.78] }, { n: 'Königsberg', at: [20.51, 54.71] }, { n: 'Stettin', at: [14.55, 53.43] },
  { n: 'Hannover', at: [9.73, 52.37] }, { n: 'Nürnberg', at: [11.08, 49.45] }, { n: 'Magdeburg', at: [11.63, 52.13] },
  { n: 'Weimar', at: [11.33, 50.98] }, { n: 'Karlsruhe', at: [8.4, 49.01] }, { n: 'Münster', at: [7.63, 51.96] },
  { n: 'Kiel', at: [10.13, 54.32] }, { n: 'Schwerin', at: [11.41, 53.63] }, { n: 'Kassel', at: [9.5, 51.32] },
];

export const RIVERS = [
  [[7.6, 47.58], [7.58, 48.1], [7.82, 48.62], [8.22, 48.97], [8.45, 49.3], [8.4, 49.58], [8.27, 50.0], [7.9, 49.97], [7.6, 50.35], [7.1, 50.73], [6.96, 50.94], [6.77, 51.22], [6.74, 51.43], [6.6, 51.66], [6.25, 51.83]],
  [[14.24, 50.9], [13.74, 51.05], [13.3, 51.3], [13.0, 51.56], [12.65, 51.87], [12.25, 51.87], [11.63, 52.13], [11.97, 52.55], [12.05, 52.85], [11.75, 53.0], [11.3, 53.12], [10.55, 53.37], [9.95, 53.52], [9.5, 53.7], [9.05, 53.86]],
  [[18.3, 49.95], [18.22, 50.09], [17.93, 50.67], [17.47, 50.86], [17.03, 51.11], [16.08, 51.66], [15.5, 52.05], [14.55, 52.35], [14.65, 52.58], [14.15, 52.85], [14.28, 53.06], [14.55, 53.43], [14.3, 53.75], [14.25, 53.93]],
  [[8.5, 47.95], [9.22, 48.09], [9.99, 48.4], [10.78, 48.72], [11.42, 48.76], [12.1, 49.02], [12.57, 48.88], [13.45, 48.57]],
  [[9.65, 51.42], [9.38, 51.77], [9.36, 52.1], [8.92, 52.29], [9.2, 52.64], [9.23, 52.92], [8.8, 53.08], [8.55, 53.55]],
  [[11.5, 50.0], [10.9, 49.9], [10.23, 50.05], [9.93, 49.79], [9.6, 49.8], [9.15, 49.97], [8.68, 50.11], [8.27, 50.0]],
];

// Seas and foreign coasts for the printed paper map (lon/lat; '@key' references P).
export const NORTH_SEA = [[1.5, 51.0], [2.5, 51.1], [3.2, 51.33], [3.6, 51.45], [3.9, 51.8], [4.1, 52.0], [4.55, 52.45], [4.75, 52.95], [5.3, 53.2], [5.6, 53.35], [6.3, 53.42], [6.9, 53.42],
  '@nl1', '@ns1', '@ns2', '@ns3', '@ns4', '@ns5', '@ns6', '@ns7', '@ns8', '@ns9', '@ns10', '@elbe1', '@sh1', '@sh2', '@sh3', '@sh4', '@sh5', '@dk1',
  [8.6, 55.1], [8.1, 55.55], [8.15, 56.0], [8.1, 56.6], [8.3, 57.0], [8.6, 57.12], [9.4, 57.17], [9.9, 57.6], [10.3, 58.4], [1.5, 58.4]];
export const BALTIC = ['@dk3', [9.6, 55.0], [9.75, 55.25], [9.8, 55.55], [10.2, 55.85], [10.25, 56.15], [10.9, 56.45], [10.35, 56.7], [10.3, 57.0], [10.55, 57.5], [10.6, 57.74], [10.3, 58.4],
  [22.2, 58.4], [21.7, 57.5], [21.4, 57.2], [21.0, 56.5], [21.07, 55.72], '@op6', '@op5', '@op4', '@op3', '@op2', '@op1',
  [19.0, 54.35], [18.65, 54.4], [18.55, 54.55], [18.45, 54.72], [18.3, 54.83], '@p12', '@p11', '@p10', '@p9', '@p8', '@p7', '@p6', '@p5', '@p4', '@p3d', '@p3c', '@p3b', '@p3a', '@p3', '@p2', '@p1',
  '@m4', '@m3', '@m2', '@m1', '@b8', '@b7', '@b6', '@b5', '@b4', '@b3', '@b2', '@b1'];
export const ISLANDS = [
  [[11.5, 58.4], [11.9, 57.7], [12.2, 57.1], [12.85, 56.67], [12.6, 56.4], [12.45, 56.3], [12.7, 56.05], [13.0, 55.6], [12.82, 55.4], [13.15, 55.37], [13.82, 55.43], [14.35, 55.55], [14.3, 55.93], [14.85, 56.17], [15.6, 56.15], [16.0, 56.3], [16.35, 56.66], [16.5, 57.0], [16.65, 57.5], [16.7, 58.4]],
  [[16.4, 56.2], [16.6, 56.6], [17.0, 57.3], [17.1, 57.35], [16.75, 56.75], [16.5, 56.25]],
  [[18.2, 57.0], [18.1, 57.3], [18.5, 57.85], [19.0, 57.9], [18.75, 57.25], [18.35, 56.92]],
  [[9.8, 55.5], [10.4, 55.6], [10.75, 55.45], [10.8, 55.15], [10.5, 55.0], [10.1, 55.1], [9.9, 55.25]],
  [[11.1, 55.7], [11.3, 55.95], [11.75, 55.95], [12.3, 56.1], [12.6, 56.0], [12.6, 55.65], [12.2, 55.4], [12.4, 55.25], [12.05, 55.0], [11.7, 55.15], [11.25, 55.2], [11.1, 55.4]],
  [[11.0, 54.85], [11.5, 54.95], [12.15, 54.9], [12.0, 54.6], [11.5, 54.62], [11.05, 54.75]],
  [[14.7, 55.1], [14.75, 55.3], [15.15, 55.15], [15.1, 55.0]],
];
export const MAP_LABELS = [
  { t: 'NORDSEE', at: [5.6, 54.8], sea: true, size: 1.5 }, { t: 'OSTSEE', at: [16.4, 55.25], sea: true, size: 1.5 },
  { t: 'POLEN', at: [19.6, 52.0], size: 1.7 }, { t: 'TSCHECHOSLOWAKEI', at: [15.6, 49.75], size: 1.25 },
  { t: 'ÖSTERREICH', at: [14.6, 47.55], size: 1.25 }, { t: 'SCHWEIZ', at: [8.2, 46.95], size: 1.1 },
  { t: 'FRANKREICH', at: [4.4, 48.5], size: 1.7 }, { t: 'BELGIEN', at: [4.6, 50.55], size: 1.0 },
  { t: 'NIEDERLANDE', at: [5.3, 52.25], size: 0.95 }, { t: 'DÄNEMARK', at: [9.2, 55.9], size: 0.95 },
  { t: 'LITAUEN', at: [23.6, 55.5], size: 1.0 }, { t: 'SCHWEDEN', at: [14.2, 57.2], size: 1.1 },
  { t: 'Freie Stadt Danzig', at: [18.75, 54.12], size: 0.55, it: true }, { t: 'Korridor', at: [18.2, 53.45], size: 0.6, it: true },
];

// ---- Characters ----------------------------------------------------------
// Portrait parameters drive the procedural linocut busts in ui/portraits.js
export const CHARS = {
  puender: { name: 'Hermann Pünder', role: 'State Secretary, Reich Chancellery', tint: '#8b98a8', hair: 'part', glasses: 'round', face: 0.95 },
  hindenburg: { name: 'Paul von Hindenburg', role: 'Reich President · Field Marshal', tint: '#b99a56', hair: 'crop', stache: 'walrus', dress: 'uniform', face: 1.15, old: true },
  stresemann: { name: 'Gustav Stresemann', role: 'Foreign Minister · DVP', tint: '#3f93a6', hair: 'bald', face: 1.12, stache: 'small' },
  hilferding: { name: 'Rudolf Hilferding', role: 'Finance Minister · SPD', tint: '#e0503a', hair: 'receding', stache: 'small', face: 1.05, glasses: 'pince' },
  groener: { name: 'Wilhelm Groener', role: 'Reichswehr Minister · General', tint: '#6f7b5c', hair: 'crop', stache: 'brush', dress: 'uniform', face: 1.08, old: true },
  schleicher: { name: 'Kurt von Schleicher', role: 'Major General · Ministeramt', tint: '#6f7b5c', hair: 'bald', dress: 'uniform', face: 1.0 },
  severing: { name: 'Carl Severing', role: 'Interior Minister · SPD', tint: '#e0503a', hair: 'swept', stache: 'brush', face: 1.0 },
  wissell: { name: 'Rudolf Wissell', role: 'Labour Minister · SPD', tint: '#e0503a', hair: 'receding', stache: 'goatee', face: 0.98, old: true },
  bruening: { name: 'Heinrich Brüning', role: 'Zentrum floor leader', tint: '#8b98a8', hair: 'receding', glasses: 'round', face: 0.88 },
  braun: { name: 'Otto Braun', role: 'Minister-President of Prussia · SPD', tint: '#e0503a', hair: 'crop', glasses: 'round', face: 1.15 },
  wels: { name: 'Otto Wels', role: 'Chairman of the SPD', tint: '#e0503a', hair: 'swept', stache: 'brush', face: 1.18 },
  schacht: { name: 'Hjalmar Schacht', role: 'President of the Reichsbank', tint: '#a79d8a', hair: 'part', glasses: 'round', face: 0.86, collar: true, stache: 'small' },
  luther: { name: 'Hans Luther', role: 'President of the Reichsbank', tint: '#a79d8a', hair: 'bald', face: 1.2 },
  hugenberg: { name: 'Alfred Hugenberg', role: 'Chairman of the DNVP · press magnate', tint: '#3c63b0', hair: 'brushcut', stache: 'walrus', glasses: 'round', face: 1.2, old: true },
  hitler: { name: 'Adolf Hitler', role: 'Leader of the NSDAP', tint: '#8a5a2b', hair: 'forelock', stache: 'tooth', face: 0.98 },
  thaelmann: { name: 'Ernst Thälmann', role: 'Chairman of the KPD', tint: '#9b1b1b', hair: 'bald', face: 1.2, dress: 'worker' },
  leipart: { name: 'Theodor Leipart', role: 'Chairman of the ADGB trade unions', tint: '#e0503a', hair: 'receding', stache: 'goatee', glasses: 'round', face: 1.0, old: true },
  woytinsky: { name: 'Wladimir Woytinsky', role: 'Chief statistician of the ADGB', tint: '#e0503a', hair: 'swept', glasses: 'round', stache: 'goatee', face: 0.95 },
  curtius: { name: 'Julius Curtius', role: 'Foreign Minister · DVP', tint: '#3f93a6', hair: 'part', stache: 'small', face: 1.0 },
  meissner: { name: 'Otto Meissner', role: 'State Secretary to the President', tint: '#b99a56', hair: 'bald', glasses: 'round', face: 1.15 },
  papen: { name: 'Franz von Papen', role: 'Zentrum dissident · Herrenklub', tint: '#3c63b0', hair: 'part', stache: 'small', face: 0.86, collar: true },
  strasser: { name: 'Gregor Strasser', role: 'Reich Organisation Leader, NSDAP', tint: '#8a5a2b', hair: 'bald', face: 1.2 },
};

export const TURN_LABELS = [];
{
  const seasons = ['Summer', 'Autumn', 'Winter', 'Spring'];
  for (let t = 0; t < 20; t++) {
    const q = t % 4; const year = 1928 + Math.floor((t + 2) / 4);
    TURN_LABELS.push({ season: seasons[q], year, text: `${seasons[q]} ${year}` });
  }
}
