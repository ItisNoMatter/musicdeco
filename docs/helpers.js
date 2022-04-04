//const mm = window.mm;

function change_tempo(ns, new_tempo){//nsのテンポをnew_tempoに変える
  const new_sequence = mm.NoteSequence.create(ns);
  //console.log(ns);
  new_sequence.notes = [];
  var ratio = QPM / new_tempo;
  if(ns.tempos){
    ratio = ns.tempos[0].qpm / new_tempo;
  }  
  ns.notes.forEach(note => {
    const new_note = copy_note(note);
    new_note.startTime *= ratio;
    new_note.endTime *= ratio; 
    new_sequence.notes.push(new_note);
  });
  new_sequence.totalTime *= ratio;
  new_sequence.tempos = [{time:0, qpm:new_tempo}];
  /*
  const r = {};
  r.notes = new_sequence;
  r.tempos = [{time:0,qpm:new_tempo}];
  r.totalTime = ns.totalTime * ratio;
  */
  return new_sequence;
}

function copy_note(note){//noteをコピーする
  /*
  const new_note = {};
  new_note.startTime = note.startTime;
  new_note.endTime = note.endTime;
  new_note.instrument = note.instrument;
  new_note.isDrum = note.isDrum;
  new_note.pitch = note.pitch;
  new_note.program = note.program;
  new_note.velocity = note.velocity;*/
  const new_note = mm.NoteSequence.Note.create(note);
  return new_note;
}

function add_note(...seqs){//tempoが同じである前提で同時再生
  //const new_sequence = [];
  console.log("add_note seqs");
  console.log(seqs);
  var r = mm.NoteSequence.create(seqs[seqs.length-1]);
  r.notes = [];
  //console.log("r");
  //console.log(r);
  seqs.forEach(seq=>{
    seq.notes.forEach(note=>{
      r.notes.push(copy_note(note));
    });
  });
  //console.log("r2");
  //console.log(r);
  //r.notes = new_sequence;
  //var new_tempo = QPM;//default
  //console.log(seqs[seqs.length-1]);
  //if(seqs[seqs.length-1].tempos){
  //  new_tempo = seqs[seqs.length-1].tempos[0].qpm;
  //}
  if(!r.tempos){
    r.tempos = [{time:0,qpm:QPM}];
  }
  r.totalTime = Math.max(...seqs.map(seq => seq.totalTime));
  //console.log(r.totalTime);  
  //console.log(seqs.map(seq => seq.totalTime));
  return r;
}

function adjust_tempo_sub(ns,to){//nsをtoのテンポに合わせる
  var tempo;
  try{
    tempo = to.tempos[0].qpm;
  }catch(e){
    tempo = QPM;
  }
  const new_ns=change_tempo(ns,tempo);//ns->tempoに合わせている
  return new_ns;
}

function adjust_tempo(ns,to){
  return add_note(adjust_tempo_sub(ns,to),to);
  //toのtempoに合わせたnsとtoを同時再生させるnotesequenceを返す
}
/*for debug
function debug(str){
  console.log("input " + str);
  console.log(input)
  console.log("inputSimul " + str);
  console.log(inputSimul);
}
*/

//4拍子と仮定して小節数をカウント
function countNodule(ns,steps){
  //const tempo = ns.tempos[0].qpm;
  var tempo = QPM;
  if(ns.tempos){
    tempo = ns.tempos[0].qpm;
  }
  //console.log(tempo);
  var totalTime = ns.totalTime;
  if(totalTime==undefined){
    const input_notes = ns.notes;
    totalTime = Math.max(input_notes.map(note => note.endTime));
  }
  //console.log(totalTime);
  //console.log(totalTime*tempo/(60*steps));
  return Math.ceil(totalTime*tempo/(60*steps));
} 
/*
function calculateDelta(ns,steps){//先頭の値がどれだけズレているか計算する
  var tempo = QPM;
  if(ns.tempos){
    tempo = ns.tempos[0].qpm;
  }
  var tempo_actual = Math.round(tempo);
  var delta = Math.abs(tempo_actual-tempo);
  return delta*60*steps/(tempo_actual*tempo); 
}
*/
function timePerNodule(ns,steps){//1小節分の長さ
  var tempo = QPM;
  if(ns.tempos){
    tempo = Math.round(ns.tempos[0].qpm);
  }
  //const tempo = ns.tempos[0].qpm;
  return 60*steps/tempo;
}

//始まる箇所を調整
function trimSilence(ns,startPoints) {
  for (let i = 0; i < ns.length; i++) {
    const notes = ns[i].notes.sort((n1, n2) => n1.startTime - n2.startTime);
    //const silence = notes[0].startTime;
    for (let j = 0; j < ns[i].notes.length; j++) {
      ns[i].notes[j].startTime -= startPoints;
      ns[i].notes[j].endTime -= startPoints;
    }
  }
}

//for debug

function debugconsole(args){
  const varNameValues = (args) => {
    const result = [];
    for (const [key, value] of Object.entries(args)) {
      result.push(`${key}:${value}`)
    }
    return result;
  }
  console.log(varNameValues({args}));
}





/*split by track*/
function getInstruments(ns) {
  return splitSequence(ns);
}

function getMelody(seqs) {
  // instrument, polyphony, notes, range;
  const instruments = [];
  
  // Some rules.
  const POLYPHONY_EPSILON = 5;
  const DISTINCT_EPSILON = 5;
  const MIN_PITCH = 49;
  
  for (let i = 0; i < seqs.length; i++) {
    const ns = seqs[i];
    const program = ns.notes[0].program;
    const notes = ns.notes.length;
    const polyphony = getPolyphony(ns);
    const pitches = ns.notes.map(n => n.pitch);
    //map:配列のすべての要素に対して呼び出す
    //音の高さのリスト
    const distinctPitches = [...new Set(pitches)].length;
    //pitchesに含まれる音の高さの種類の数
    const minPitch = Math.min(...pitches);
    const maxPitch = Math.max(...pitches);
    instruments.push([ns.notes[0].instrument, 
                      {polyphony: polyphony < POLYPHONY_EPSILON ? 0 : polyphony, 
                       notes: ns.notes.length, 
                       distinct: distinctPitches > DISTINCT_EPSILON ? 1 : -1,
                       inRange: minPitch >= MIN_PITCH ? 1 : -1}]);
  }
  
  //  Sort by magic.
  instruments.sort((a, b) => {//一定のルールに従ってソートしてることは分かった
    const result = 
          b[1].inRange - a[1].inRange ||       // pitches are in range 
          b[1].distinct - a[1].distinct ||       // pitches are distinct enough
          a[1].polyphony - b[1].polyphony ||   // smallest polyphony
          b[1].notes - b[1].notes;             // most notes
    return result;
  });
  
  return seqs[instruments[0][0]];//?
}


function splitSequence(ns) {//instrumentごとにnoteを分ける
  const seqs = [];
  let instruments = [];
  for (let note of ns.notes) {
    if (instruments.indexOf(note.instrument) === -1) {//instrumentに存在しなければ追加
      instruments.push(note.instrument);
    }
  }
  for (let i of instruments) {
    seqs.push(extractForInstrument(ns, i));
  }
  return seqs;
}


function extractForInstrument(ns, instrument) {
  const out = mm.NoteSequence.create(ns);
  out.notes = [];
  
  for (let note of ns.notes) {
    if (note.instrument === instrument) {//instrumentのものだけ抽出
      // Make a copy just in case.
      const n = mm.NoteSequence.Note.create(note);
      out.notes.push(n);
    }
  }
  return out;
}

function getPolyphony(ns) {
  // Is it almost monophonic?
  let polyphony = 0;
  const qs = mm.sequences.quantizeNoteSequence(ns, 4);
  const sortedNotes = qs.notes.sort((n1, n2) => {
    if (n1.quantizedStartStep === n2.quantizedStartStep) {
      return n2.pitch - n1.pitch;
    }
    return n1.quantizedStartStep - n2.quantizedStartStep;
  });
  
  let lastStart = -1;
  sortedNotes.forEach(n => {
    if (n.quantizedStartStep === lastStart) {
      polyphony++;
    }
    lastStart = n.quantizedStartStep;
  });
  return polyphony;
}
