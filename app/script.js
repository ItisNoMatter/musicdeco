//let isMelodyMode = true;

// Models.
//let mvae;

// Soundfont players.
let playerInput,playerSimul,playerVAE;

let playerInd = 0;

// MIDI Visualizers.
let vizInput,vizSimul,vizMusicVAE;

// The melodies for each of the players/visualizer pairs.
let input, inputSimul, melody, currentSample,simul, simulForSave;
let playerSaidStop = false;  // So that we can loop.

let filename = "MusicVAE.mid"

let training = {};

let notelists = [];
//html items

init();

function init() {
  var fileBtn = document.getElementById("fileBtn");
  fileBtn.addEventListener('change', loadFile); //load a midi file 
  var sampleBtn = document.getElementById("sampleBtn");
  sampleBtn.addEventListener('click', loadSample);
  var urlBtn = document.getElementById("urlBtn");
  urlBtn.addEventListener('click', loadURL);
  var SimulBtn = document.getElementById("SimulBtn");
  SimulBtn.addEventListener('click', loadSimul);
  var SaveBtn = document.getElementById("SaveBtn");
  //SaveBtn.addEventListener('click', () => saveAs(new File([mm.sequenceProtoToMidi(inputSimul)], 'sample.mid')));
  SaveBtn.addEventListener('click', () => {
    //saveAs(new File([mm.sequenceProtoToMidi(inputSimul)], filename.replace(".mid","-multitrackChords.mid")));
    const midi = mm.sequenceProtoToMidi(inputSimul);
    const file = new Blob([midi], {type: 'audio/midi'});
    
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, filename.replace(".mid","-multitrackChords.mid"));
    } else { // Others
      const a = document.createElement('a');
      const url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename.replace(".mid","-multitrackChords.mid");
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }

  //modelInitialize();
});
  
  //mmはhelpers.jsで定義されているので無視してOK
  
  var btnPlayInput = document.getElementById("btnPlayInput");
  btnPlayInput.addEventListener('click', (e) => play(e, 0));
  var btnPlaySimul = document.getElementById("btnPlaySimul");
  btnPlaySimul.addEventListener('click', (e) => play(e, 1));
  var btnPlayVAE = document.getElementById("btnPlayVAE");
  btnPlayVAE.addEventListener('click', (e) => play(e, 2));

  //mode = false;
  //isMelodyMode = mode;
  
  //updateUI('model-loading');
  
  //サウンドフォント
  //playerInput = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
  playerInput = initPlayerAndEffects();

  playerInput.callbackObject = {
    run: (note) => vizInput.redraw(note, true),
    stop: () => {}
  };
  
  //playerSimul = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
  playerSimul = initPlayerAndEffects();

  playerSimul.callbackObject = {
    run: (note) => vizSimul.redraw(note, true),
    stop: () => {}
  };

  //playerVAE = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
  playerVAE = initPlayerAndEffects();

  playerVAE.callbackObject = {
    run: (note) => vizMusicVAE.redraw(note, true),
    stop: () => {}
  };

  barNumberSelect.addEventListener('change',function(){
    const number = this.selectedIndex;
    new Promise(function(resolve,reject){
      for(var i=0;i<document.form1.sound.length;i++){
        var s = document.form1.sound[i];
        if(notelists[number].indexOf(i)==-1){
          s.checked=false;
        }else{
          s.checked=true;
        }
      }
      resolve(notelists[number]);
    }).then(chordSuggestion);
  });

  var loadModelBtn = document.getElementById('load-musicvae');
  loadModelBtn.addEventListener('click',modelInitialize);

}

// Loads a file from the user.
function loadFile() {
  //playerInd = 0;
  updateUI('file-loading');

  const promises = [];
  var fileInput = document.getElementById("fileInput");
  for (let i = 0; i < fileInput.files.length; i++) {
    promises.push(mm.blobToNoteSequence(fileInput.files[i]));//midi->タイムライン表示
    filename = fileInput.files[i].name;
    //getElementById().filesでファイルを取得
    //mm.blobToNoteSequenceはPromise<NoteSequence>をreturnする
  }
  //promisesに関するすべての処理が終わったらshowInputを呼び出す的な
  //javaScriptの非同期処理の構文
  //Promise.all(promises).then(showInput);
  Promise.all(promises).then((seq)=>(showInput(seq,0)));
}

// Loads an example if you don't have a file.
function loadSample() {
  //playerInd = 0;
  updateUI('file-loading');
  const url = "./mid/Tokyo_Ghoul_-_Unravel.mid";
  /*
  const url = isMelodyMode ? 
        'https://cdn.glitch.com/d18fef17-09a1-41f5-a5ff-63a80674b090%2Fmel_input.mid?v=1564186536933':
        'https://cdn.glitch.com/d18fef17-09a1-41f5-a5ff-63a80674b090%2Ftrios_input.mid?v=1564186506192';
        */
  //const url = 'https://cdn.glitch.com/d18fef17-09a1-41f5-a5ff-63a80674b090%2Fchpn_op10_e01_format0.mid?1556142864200';
  mm.urlToNoteSequence(url).then((mel) => {
    //mm.urlToNoteSequence:Fetches a MIDI file from a url and converts it to a NoteSequenc・・
    filename = "Unravel.mid";
  /*
  const mel = {
    notes: [
      {pitch: 60, startTime: 0.0, endTime: 0.5},
      {pitch: 60, startTime: 0.5, endTime: 1.0},
      {pitch: 67, startTime: 1.0, endTime: 1.5},
      {pitch: 67, startTime: 1.5, endTime: 2.0},
      {pitch: 69, startTime: 2.0, endTime: 2.5},
      {pitch: 69, startTime: 2.5, endTime: 3.0},
      {pitch: 67, startTime: 3.0, endTime: 4.0},
      {pitch: 65, startTime: 4.0, endTime: 4.5},
      {pitch: 65, startTime: 4.5, endTime: 5.0},
      {pitch: 64, startTime: 5.0, endTime: 5.5},
      {pitch: 64, startTime: 5.5, endTime: 6.0},
      {pitch: 62, startTime: 6.0, endTime: 6.5},
      {pitch: 62, startTime: 6.5, endTime: 7.0},
      {pitch: 60, startTime: 7.0, endTime: 8.0},  
    ],
    totalTime: 8,
    tempos:[{time:0,qpm:QPM}]
  };*/
    console.log(mel);
    showInput([mel],0);
  });
}

function loadURL() {
  //playerInd = 0;
  updateUI('file-loading');

  // Oops, urlToNoteSequence doesn't reject correctly,
  // so do this by hand for now.
  mm.urlToBlob(urlInput.value).then((blob) => {
    //mm.urlToBlob:Fetches a MIDI file from a url and returns a Blob with its contents.
    //Returns Promise<Blob>
    const reader = new FileReader();
    reader.onload = (e) => {//fileの読み込みが終わったら実行される処理
      try {
        showInput([mm.midiToSequenceProto(reader.result)],0);
        filename = reader.result.name;
        //mm.midiToSequenceProto returns NoteSequence
      } catch (err) {
        updateUI('file-error');
      }
    };
    reader.readAsBinaryString(blob);
    //FileReader.readAsBinaryString()：指定されたBlobないしFileオブジェクトを読み込む
  });
}

// Drag & Drop
window.addEventListener( "DOMContentLoaded" , ()=> {
   
  const ddarea = document.getElementById("ddarea");

  // ドラッグされたデータが有効かどうかチェック
  const isValid = e => e.dataTransfer.types.indexOf("Files") >= 0;

  const ddEvent = {
    "dragover" : e=>{
        e.preventDefault(); // 既定の処理をさせない
        if( !e.currentTarget.isEqualNode( ddarea ) ) {
                // ドロップエリア外ならドロップを無効にする
            e.dataTransfer.dropEffect = "none";return;
        }
        e.stopPropagation(); // イベント伝播を止める

        if( !isValid(e) ){
                // 無効なデータがドラッグされたらドロップを無効にする
            e.dataTransfer.dropEffect = "none";return;
        }
                // ドロップのタイプを変更
        e.dataTransfer.dropEffect = "copy";
        ddarea.classList.add("ddefect");
    },
    "dragleave" : e=>{
        if( !e.currentTarget.isEqualNode( ddarea ) ) {
            return;
        }
        e.stopPropagation(); // イベント伝播を止める
        ddarea.classList.remove("ddefect");
    },
    "drop":e=>{
        e.preventDefault(); // 既定の処理をさせない
        e.stopPropagation(); // イベント伝播を止める

        updateUI('file-loading');
        const files = e.dataTransfer.files;
        
        try {
          const promises = [];
          var fileInput = e.dataTransfer;
          for (let i = 0; i < fileInput.files.length; i++) {
            promises.push(mm.blobToNoteSequence(fileInput.files[i]));
            filename = fileInput.files[i].name;
          }
          Promise.all(promises).then((seq)=>(showInput(seq,0)));
        } catch (err) {
          updateUI('file-error');
        }

        ddarea.classList.remove("ddefect");
    }
  };

  Object.keys( ddEvent ).forEach( e=>{
      ddarea.addEventListener(e,ddEvent[e]);
      document.body.addEventListener(e,ddEvent[e])
  });
  /*
  const object1 = {
    a: 'somestring',
    b: 42,
    c: false
  };

  console.log(Object.keys(object1));
  // expected output: Array ["a", "b", "c"]
  */


});


function loadSimul() {
  //updateUI('file-loading');
  //var mel = input;
  updateUI('simul-loading');
  console.log(inputVAE);
  new Promise(function(resolve,reject){
    //try{
      console.log(inputVAE);
      const ns = [adjust_tempo(inputVAE,input)];
      /*
      function adjust_tempo(ns,to){
        return add_note(adjust_tempo_sub(ns,to),to);
      //toのtempoに合わせたnsとtoを同時再生させるnotesequenceを返す
      }
      */
      console.log(inputVAE);
      resolve(ns);
    //}catch(e){
    //  updateUI('file-error');
    //}
  }).then(seq => showInput(seq,1));
}

async function showInput(ns,playerInd) {
  const quantizedMels = [];
  ns.forEach((m) => quantizedMels.push(mm.sequences.quantizeNoteSequence(m, 4)));
  if(playerInd == 1){
    //console.log("filename:" + filename.replace(".mid","-multitrackChords.mid"));
    inputSimul = mm.sequences.mergeInstruments(mm.sequences.concatenate(ns));
    console.log("inputSimul");
    console.log(inputSimul);
    playerSimul.loadSamples(inputSimul);
    vizSimul = new mm.PianoRollSVGVisualizer(
      inputSimul,//INoteSequence
      document.getElementById('vizSimul'), //SVGSVGElement
      {noteRGB:'72,61,139', activeNoteRGB:'190,120, 250', noteHeight:3}//config
    ); 
    updateUI('simul-loaded');
  }else if(playerInd == 2){
    //inputVAE = mm.sequences.unquantizeSequence(mm.sequences.concatenate(ns),input.tempos[0].qpm);
    console.log(ns);
    try{
      inputVAE = mm.sequences.unquantizeSequence(mm.sequences.concatenate(ns),input.tempos[0].qpm);
    }catch(e){
      inputVAE = mm.sequences.unquantizeSequence(mm.sequences.concatenate(ns),QPM);
    }
    //inputVAE = mm.sequences.mergeInstruments(inputVAE);
    console.log("inputVAE");
    console.log(inputVAE);
    playerVAE.loadSamples(inputVAE);
    vizMusicVAE = new mm.PianoRollSVGVisualizer(
      inputVAE,//INoteSequence
      document.getElementById('vizMusicVAE'), //SVGSVGElement
      {noteRGB:'72,61,139', activeNoteRGB:'190,120, 250', noteHeight:3}//config
    ); 
    console.log("setStoppedState");
    try{
      document.getElementById('simul').removeAttribute('hidden');
    }catch(e){

    }
    setStoppedState();
    //console.log("inputVAE");
    //console.log(inputVAE);
  }else{
    /*
    try{
      input= mm.sequences.unquantizeSequence(mm.sequences.concatenate(ns),input.tempos[0].qpm);//sequenceを"重ねずに"つなげる
    }catch(e){
      input= mm.sequences.unquantizeSequence(mm.sequences.concatenate(ns),QPM);
    }*/
    input = mm.sequences.concatenate(ns);
      /* for invalid program value */
      for(var i=0;i<input.notes.length;i++){
        note = input.notes[i];
        if(note.program==-1){
          input.notes[i].program=0;//default setting
        }
        for(let key in note){
          if(note.key==-1){
            console.log(note);
          }
        }
      }
      /* for chord suggestion */
      input.notes.sort((n1,n2)=>{
        if(Math.abs(n1.startTime - n2.startTime)>0){
          return n1.startTime - n2.startTime;
        }else if(Math.abs(n1.endTime - n2.endTime)){
          return n1.endTime - n2.endTime;
        }else{
          return n1.pitch -n2.pitch;
        }
      });
      if(!input.tempos){
        input.tempos = [];
        input.tempos[0].qpm = QPM;
      }
    //console.log("countNodule:"+countNodule(input,4).toString());
    var j=0;
    //console.log(barNumberSelect);
    //console.log("notelists");
    //console.log(notelists);
    playerInput.loadSamples(input);
    vizInput = new mm.PianoRollSVGVisualizer(
      //Displays a pianoroll as an SVG. Pitches are the vertical axis and time is the horizontal. 
      //When connected to a player, the visualizer can also highlight the notes being currently played.
      input,
      document.getElementById('vizInput'), //SVGSVGElement
      {noteRGB:'72,61,139', activeNoteRGB:'190,120, 250', noteHeight:3}//config
    ); 
    new Promise(function(resolve,reject){
      var t = timePerNodule(input,4);//1小節あたりの時間
      notelists.splice(0);
      while(barNumberSelect.firstChild){
        barNumberSelect.removeChild(barNumberSelect.firstChild);
      }
      while(chordsContainer.firstChild){
        chordsContainer.removeChild(chordsContainer.firstChild);
      }
      chordInputs.splice(0);
      var N = countNodule(input,4);//いくつの小節で構成されているか
      for(var i=0;i<N;i++){
        var notelist = [];
        //var delta = calculateDelta(input,4);
        const delta = 10**(-4);
        while(j < input.notes.length && input.notes[j].startTime <= (t+delta)*i){
          if(!input.notes[j].isDrum && input.notes[j].startTime <= (t+delta)*i && input.notes[j].endTime > t*i && notelist.indexOf(input.notes[j].pitch%12)==-1){
            notelist.push(input.notes[j].pitch%12);//i小節目の音が抽出
          }
          j++;
          if(j < input.notes.length){
            console.log(j.toString() + ' startTime delta:' + (input.notes[j].startTime-t*i).toString());
          }
        }
        var new_number = document.createElement("option");
        new_number.value = (i+1).toString();
        new_number.textContent = (i+1).toString();
        if(i==0){
          new_number.setAttribute("selected",true);
        }
        barNumberSelect.appendChild(new_number);
  
        if(i%4==0) {
          var new_chords_num = document.createElement("p");
          new_chords_num.className = "num-text";
          new_chords_num.innerText = (i+1).toString() + "-" + (i+4).toString();
          chordsContainer.appendChild(new_chords_num);
          //chordInputs.push(new_chords_num);
        }
  
        //<input id="chord1" type="text" value="N.C.">
        var new_input_chord = document.createElement("input");
        new_input_chord.type = "text";
        new_input_chord.value = "N.C.";
        new_input_chord.id = "chord" + (i+1).toString();
        chordsContainer.appendChild(new_input_chord);
        chordInputs.push(new_input_chord);
        
        notelists.push(notelist);
      }
      document.getElementById("additional-text").removeAttribute("hidden");
      
      for(var i=0;i<document.form1.sound.length;i++){
        var s = document.form1.sound[i];
        if(notelists[0].indexOf(i)==-1){
          s.checked=false;
        }else{
          s.checked=true;
        }
      }
      resolve(notelists[0])
    }).then(chordSuggestion);
    //toggleChangeChords();
    //console.log("input");
    //console.log(input);
    updateUI('file-loaded');
    //console.log(chordInputs);
    console.log(notelists);
    /*
    if(!modelInitialized){
      modelInitialize();
    }
    */
  }

  //console.log("input");
  //console.log(input);
  //console.log("inputVAE");
  //console.log(inputVAE);
  //console.log("inputSimul");
  //console.log(inputSimul);
}

async function play(event, playerIndex) {
  //console.log(playerIndex);
  let player, mel;
  if(playerIndex==0){
    player = playerInput;
    mel = input
  }else if(playerIndex==2){
    player = playerVAE;
    mel = inputVAE;
  }else{
    player = playerSimul;
    mel = inputSimul;
  } 
  //console.log(mel);
  const btn = event.target;
  if (player.isPlaying()) {
    stopPlayer(player, btn);
  } else {//if stopped
    startPlayer(player, btn);
    loopMelody(player, mel, btn);
  } 
}

function stopPlayer(player, btn) {
  console.log('stopPlayer');
  player.stop();
  playerSaidStop = true;
  btn.querySelector('.iconPlay').removeAttribute('hidden');
  btn.querySelector('.iconStop').setAttribute('hidden', true);
}

function startPlayer(player, btn) {
  console.log('startPlayer');
  playerSaidStop = false;
  btn.querySelector('.iconStop').removeAttribute('hidden');
  btn.querySelector('.iconPlay').setAttribute('hidden', true);
}

function loopMelody(player, mel, btn) {
  console.log('loopMelody');
  //player.setTempo(60);
  player.start(mel).then(() => {
    if (!playerSaidStop) {
      loopMelody(player, mel, btn);
    } else {
      stopPlayer(player, btn);
    }
  });
}
function updateUI(state) {
  function show(el)    { document.getElementById(el).removeAttribute('hidden'); }
  function hide(el)    { document.getElementById(el).setAttribute('hidden', true) };
  function enable(el)  { document.getElementById(el).removeAttribute('disabled'); }
  function disable(el) { document.getElementById(el).setAttribute('disabled', true) };
  switch(state) {
    case 'file-loading':
      show('status');
      hide('input');
      disable('chordsContainer');
      hide('chord-suggest');
      hide('chord-progression');
      document.getElementById('status').textContent = 'The robots are nomming on your file...';
      break;
    case 'file-error':
      show('status');
      document.getElementById('status').textContent = 'Oops, there was a problem reading your file. Make sure it\'s a valid MIDI and try again?';
      break;
    case 'file-loaded':
      hide('status');
      show('input');
      enable('input');
      //show('musicvae');
      //show('simul');
      show('chord-suggest');
      show('chord-progression');
      show('load-musicvae');
      //enable('chordsContainer');
      break;
    case 'simul-loading':
      hide('playback-simul');
      break;
    case 'simul-loaded':
      show('playback-simul');
      break;    
  }
}


window.updateUI = updateUI;









/*Multitrack Chords*/




const QPM = 120;
const STEPS_PER_QUARTER = 24;
const Z_DIM = 256;
const HUMANIZE_SECONDS = 0.01;

const tf = mm.tf;

// Set up Multitrack MusicVAE.
const model = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/multitrack_chords');
var modelInitialized = false;
// Set up an audio player.
//const player = initPlayerAndEffects();

// Get UI elements.
const statusDiv = document.getElementById('status_vae');
const changeChordsButton = document.getElementById('changeChords');
//const playButton = document.getElementById('play');
const sampleButton1 = document.getElementById('sample1');
const sampleButton2 = document.getElementById('sample2');
const alphaSlider = document.getElementById('alpha');
const saveButton = document.getElementById('download');
const chordsContainer = document.getElementById('chordsContainer');


//const vizMusicVAE = document.getElementById('vizMusicVAE');

//var btnPlayVAE = document.getElementById("btnPlayVAE");
//btnPlayVAE.addEventListener('click', (e) => play(e, 1));
//playerVAE = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
//var playerVAE = initPlayerAndEffects();  
//playerVAE.callbackObject = {
//  run: (note) => vizMusicVAE.redraw(note, true),
//  stop: () => {}
//};

alphaSlider.addEventListener('change',changeSliderValue);


const numSteps = +alphaSlider.max + 1;//6
//const numSteps = 1;
var numChords = chordInputs.length;

// Declare style / sequence variables.
var z1, z2;
var sliderValue;
var chordSeqs;
var progSeqs;

var changingChords = false;
var playing = false;

var chords = chordInputs.map(c => c.value);

sampleButton1.onclick = updateSample1;
sampleButton2.onclick = updateSample2;
//playButton.onclick = togglePlaying;
saveButton.onclick = saveSequence;
changeChordsButton.onclick = toggleChangeChords;
chordInputs.forEach(c => c.oninput = chordChanged);

function modelInitialize(){
  modelInitialized = true;
  document.getElementById('musicvae').removeAttribute('hidden');
  document.getElementById('load-musicvae').setAttribute('hidden',true);
  numChords = chordInputs.length;
  chords = chordInputs.map(c => c.value);
  model.initialize()
  .then(() => {
    console.log("setLoadingState");
    setLoadingState();
    //setUpdatingState();//statusをupdate
    setTimeout(() => {
      generateSample(z => {
        z1 = z;
        generateSample(z => {
          z2 = z;
          sliderValue = alphaSlider.value;
          generateProgressions(setStoppedState);//音楽生成とかをやってる
        });
      });
    }, 0);
  });
}

// Sample a latent vector.
function generateSample(doneCallback) {//doneCallback:関数
  const z = tf.randomNormal([1, Z_DIM]);
  //param:An array of integers defining the shape of the output tensor
  //return value:tf.Tensor（指定されたサイズのランダムな値？）
  //console.log("data");
  //console.log(z.data());
  z.data().then(zArray => {//data()では何をやっている？
    z.dispose();
    //メモリの破壊
    doneCallback(zArray);//z => {z1 = z},z => {z2 = z}
  });
}

// Randomly adjust note times.
function humanize(s) {
  const seq = mm.sequences.clone(s);
  seq.notes.forEach((note) => {
    let offset = HUMANIZE_SECONDS * (Math.random() - 0.5);
    if (seq.notes.startTime + offset < 0) {
      offset = -seq.notes.startTime;
    }
    if (seq.notes.endTime > seq.totalTime) {
      offset = seq.totalTime - seq.notes.endTime;
    }
    seq.notes.startTime += offset;
    seq.notes.endTime += offset;
  });
  return seq;
}

// Construct spherical linear interpolation tensor.
function slerp(z1, z2, n) {
  const norm1 = tf.norm(z1);
  //debugconsole(norm1);
  const norm2 = tf.norm(z2);
  const omega = tf.acos(tf.matMul(tf.div(z1, norm1),
                                  tf.div(z2, norm2),
                                  false, true));
  //debugconsole(omega);                                
  const sinOmega = tf.sin(omega);
  //debugconsole(sinOmega);
  const t1 = tf.linspace(1, 0, n);
  const t2 = tf.linspace(0, 1, n);
  //debugconsole(t1);
  const alpha1 = tf.div(tf.sin(tf.mul(t1, omega)), sinOmega).as2D(n, 1);
  //debugconsole(alpha1);
  const alpha2 = tf.div(tf.sin(tf.mul(t2, omega)), sinOmega).as2D(n, 1);
  const z = tf.add(tf.mul(alpha1, z1), tf.mul(alpha2, z2));
  //debugconsole(z);
  return z;
}

// Concatenate multiple NoteSequence objects.
function concatenateSequences(seqs) {
  //console.log("concatenateSequences seqs");
  //console.log(seqs);
  const seq = mm.sequences.clone(seqs[0]);
  let numSteps = seqs[0].totalQuantizedSteps;
  //let numSteps;
  /*
  if(seqs[0].totalQuantizedSteps){
    numSteps = seqs[0].totalQuantizedSteps;
  }else{
    numSteps = 0;
  }
  console.log(numSteps);
  */
  for (let i=1; i<seqs.length; i++) {
    const s = mm.sequences.clone(seqs[i]);
    s.notes.forEach(note => {
      note.quantizedStartStep += numSteps;
      note.quantizedEndStep += numSteps;
      seq.notes.push(note);
    });
    numSteps += s.totalQuantizedSteps;
  }
  seq.totalQuantizedSteps = numSteps;
  return seq;
}

// Interpolate the two styles for a single chord.
function interpolateSamples(chord, doneCallback) {//4回
  //console.log("interpolateSamples"); 
  //if(chord=='N.C.'){
  //  doneCallback({note:[],totalTime:8});
  //}
  const z1Tensor = tf.tensor2d(z1, [1, Z_DIM]);
  const z2Tensor = tf.tensor2d(z2, [1, Z_DIM]);
  const zInterp = slerp(z1Tensor, z2Tensor, numSteps);
  
  //model.decode(zInterp, undefined, [chord], STEPS_PER_QUARTER)
  //  .then(sequences => doneCallback(sequences));
  console.log(chord);
  model.decode(zInterp, undefined, [chord], STEPS_PER_QUARTER)//chordに応じた音楽を生成（sequencesがその音楽）
    .then(sequences => {
      if(chord=='N.C.'){
        for(var i=0;i<sequences.length;i++){
          sequences[i].notes.splice(0);//N.C.の場合はnotes:[]（何の音も鳴らない）とする
        }
      }
      doneCallback(sequences);
    });
}

// Generate interpolations for all chords.
function generateInterpolations(chordIndex, result, doneCallback) {
  if (chordIndex === numChords) {//for i in range(numChords)的な感じで再帰
    //console.log("result");
    //console.log(result);
    doneCallback(result);
  } else {
    interpolateSamples(chords[chordIndex], seqs => {
      //console.log("interpolateSamples after");
      //console.log(seqs);
      for (let i=0; i<numSteps; i++) {
        result[i].push(seqs[i]);//生成した音楽を追加
      }
      generateInterpolations(chordIndex + 1, result, doneCallback);
    })
  }
}

// Generate chord progression for each alpha.
function generateProgressions(doneCallback) {
  let temp = [];
  for (let i=0; i<numSteps; i++) {
  //for (let i=0; i<numChords; i++) {  
    temp.push([]);
  }
  //temp = [[]]*4
  generateInterpolations(0, temp, seqs => {
    chordSeqs = seqs;//[chordごとに生成した音楽が入ってる配列（length:小節数）]×sliderの範囲の数
    console.log("chordSeqs");
    console.log(chordSeqs);
    concatSeqs = chordSeqs.map(s => concatenateSequences(s));//concat（つなげてる）
    //console.log("concatSeqs");
    //console.log(concatSeqs);
    progSeqs = concatSeqs.map(seq => {//雑処理を行ったあと
      const mergedSeq = mm.sequences.mergeInstruments(seq);
      const progSeq = mm.sequences.unquantizeSequence(mergedSeq);
      progSeq.ticksPerQuarter = STEPS_PER_QUARTER;
      return progSeq;
    });//progSeqs.length = slider.length?

    //console.log("progSeqs");
    //console.log(progSeqs);
    //const fullSeq = concatenateSequences(concatSeqs);
    //console.log(fullSeq);
    //const mergedFullSeq = mm.sequences.mergeInstruments(fullSeq);
    const mergedSeq = mm.sequences.mergeInstruments(progSeqs[sliderValue]);
    console.log("mergedSeq");
    console.log(mergedSeq);
    //setLoadingState();
    console.log("setUpdatingState");
    setUpdatingState();
    //playerInd = 2;
    showInput([mergedSeq],2);
    doneCallback();
    /*
    playerVAE.loadSamples(mergedSeq)
      .then(doneCallback);*/
  });  
}

// Set UI state to updating styles.
function setUpdatingState() {
  statusDiv.innerText = 'Updating arrangements...';
  controls.setAttribute('disabled', true);
  document.getElementById('generated-music').setAttribute('hidden',true);
}

// Set UI state to updating instruments.
function setLoadingState() {
  statusDiv.innerText = 'Loading samples...';
  controls.setAttribute('disabled', true);
  chordsContainer.setAttribute('disabled', true);
  changeChordsButton.innerText = 'Change chords';
}

// Set UI state to playing.
function setStoppedState() {
  statusDiv.innerText = 'Ready to play!';
  statusDiv.classList.remove('loading');
  controls.removeAttribute('disabled');
  chordsContainer.setAttribute('disabled', true);
  changeChordsButton.innerText = 'Change chords';
  //playButton.innerText = 'Play';
  chordInputs.forEach(c => c.classList.remove('playing'));
  document.getElementById('generated-music').removeAttribute('hidden');
}

// Set UI state to playing.
function setPlayingState() {
  statusDiv.innerText = 'Move the slider to interpolate between styles.';
  //playButton.innerText = 'Stop';
  controls.removeAttribute('disabled');
  chordsContainer.setAttribute('disabled', true);
  changeChordsButton.innerText = 'Change chords';
}

// Set UI state to changing chords.
function setChordChangeState() {
  statusDiv.innerText = 'Change chords (triads only) then press Done.';
  changeChordsButton.innerText = 'Done';
  chordsContainer.removeAttribute('disabled');
  chordInputs.forEach(c => c.classList.remove('playing'));
}

// Play the interpolated sequence for the current slider position.
/*
function playProgression(chordIdx) {
  const idx = alphaSlider.value;
  
  chordInputs.forEach(c => c.classList.remove('playing'));
  chordInputs[chordIdx].classList.add('playing');
  
  const unquantizedSeq = mm.sequences.unquantizeSequence(chordSeqs[idx][chordIdx]);
  //playerInd = 2;
  showInput(humanize(unquantizedSeq),2);
  playerVAE.start(humanize(unquantizedSeq))
    .then(() => {
      //const nextChordIdx = (chordIdx + 1) % numChords;
      if(chordIdx + 1 < numChords){
        const nextChordIdx = chordIdx + 1;
        playProgression(nextChordIdx);
      }
    });
}
*/

// Update the slider value
function changeSliderValue(){
  //if(!modelInitialized)return;
  playing = false;
  setUpdatingState();
  playerVAE.stop();
  setTimeout(()=>{
    sliderValue = alphaSlider.value;
    generateProgressions(setStoppedState);
  },0);
}

// Update the start style.
function updateSample1() {
  //if(!modelInitialized)return;
  playing = false;
  setUpdatingState();
  playerVAE.stop();
  setTimeout(() => {
    generateSample(z => {
      z1 = z;
      generateProgressions(setStoppedState);
    });
  }, 0);
}

// Update the end style.
function updateSample2() {
  //if(!modelInitialized)return;
  playing = false;
  setUpdatingState();
  playerVAE.stop();
  setTimeout(() => {
    generateSample(z => {
      z2 = z;
      generateProgressions(setStoppedState);
    });
  }, 0);
}

// Save sequence as MIDI.
function saveSequence() {
  //const idx = alphaSlider.value;
  const midi = mm.sequenceProtoToMidi(progSeqs[sliderValue]);
  const file = new Blob([midi], {type: 'audio/midi'});
    
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, 'multitrackChords.mid');
  } else { // Others
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'multitrackChords.mid';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }
}

// Start or stop playing the sequence at the current slider position.
/*
function togglePlaying() {
  mm.Player.tone.context.resume();
  
  if (playing) {
    playing = false;
    setStoppedState();
    playerVAE.stop();
  } else {
    playing = true;
    setPlayingState();
    playProgression(0);
  }
}
*/
// Start or finish changing chords.
function toggleChangeChords() {
  console.log(changingChords);
  if (changingChords) {
    numChords = chordInputs.length;
    changingChords = false;
    chords = chordInputs.map(c => c.value);
    //console.log(chords);
    if(modelInitialized){
      setUpdatingState();
      setTimeout(() => generateProgressions(setStoppedState), 0);
    }else{
      document.getElementById('changeChords').textContent = "Change";
      statusDiv.innerText = 'Loading samples...';
    }
  } else {
    playing = false;
    changingChords = true;
    console.log("setChordChangeState");
    setChordChangeState();
    playerVAE.stop();
  }
}

// One of the chords has been edited.
function chordChanged() {
  const isGood = (chord) => {
    if (!chord) {
      return false;
    }
    try {
      mm.chords.ChordSymbols.pitches(chord);
      //console.log(mm.chords.ChordSymbols.pitches(chord));
      return true;
    } catch(e) {
      if(chord=='N.C.')return true;
      return false;
    }
  }
  
  var allGood = true;
  chordInputs.forEach(c => {
    //console.log(c.classList);
    if (isGood(c.value)) {
      c.classList.remove('invalid');
    } else {
      c.classList.add('invalid');
      allGood = false;
    }
  });

  changeChordsButton.disabled = !allGood;
}


function initPlayerAndEffects() {
  const MAX_PAN = 0.2;
  const MIN_DRUM = 35;
  const MAX_DRUM = 81;
  
  // Set up effects chain.
  const globalCompressor = new mm.Player.tone.MultibandCompressor();
  const globalReverb = new mm.Player.tone.Freeverb(0.25);
  const globalLimiter = new mm.Player.tone.Limiter();
  globalCompressor.connect(globalReverb);
  globalReverb.connect(globalLimiter);
  globalLimiter.connect(mm.Player.tone.Master);

  // Set up per-program effects.
  const programMap = new Map();
  for (let i = 0; i < 128; i++) {
    const programCompressor = new mm.Player.tone.Compressor();
    const pan = 2 * MAX_PAN * Math.random() - MAX_PAN;
    const programPanner = new mm.Player.tone.Panner(pan);  
    programMap.set(i, programCompressor);
    programCompressor.connect(programPanner);
    programPanner.connect(globalCompressor);
  }

  // Set up per-drum effects.
  const drumMap = new Map();
  for (let i = MIN_DRUM; i <= MAX_DRUM; i++) {
    const drumCompressor = new mm.Player.tone.Compressor();
    const pan = 2 * MAX_PAN * Math.random() - MAX_PAN;
    const drumPanner = new mm.Player.tone.Panner(pan);
    drumMap.set(i, drumCompressor);
    drumCompressor.connect(drumPanner);  
    drumPanner.connect(globalCompressor);
  }
  
  // Set up SoundFont player.
  
  const player = new mm.SoundFontPlayer(
      'https://storage.googleapis.com/download.magenta.tensorflow.org/soundfonts_js/sgm_plus', 
    globalCompressor, programMap, drumMap);
    
  //const player = new mm.Player(); 
  return player;
}