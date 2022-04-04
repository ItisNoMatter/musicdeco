//const mm = window.mm;

var chordList = document.getElementById("chord-list");
//var visualizers = [];

var playBtns = [];
var sequences = [];
var playerList = [];

const soundList = document.getElementById("sound-list");
const barNumberSelect = document.getElementById("bar-number");
var searchType = true;//and -> true, or->false
/*
const chordInputs = [
    document.getElementById('chord1'),
    document.getElementById('chord2'),
    document.getElementById('chord3'),
    document.getElementById('chord4')
];
*/
const chordInputs = [];
soundNameList.forEach(sound=>{
    const new_div = document.createElement('div');
    new_div.className = "sound-checkbox";
    const new_option = document.createElement('input');
    const new_label = document.createElement('label');
    new_option.name = "sound";
    new_option.type = "checkbox";
    new_option.value = sound;
    new_option.addEventListener('change',()=>{
        const notelist = [];
        document.form1.sound.forEach(s =>{
            if(s.checked){
                notelist.push(soundNameList.indexOf(s.value))
            }
        });
        //console.log(notelist);
        if(searchType){
            chordSuggestionAnd(notelist);
        }else{
            chordSuggestionCount(notelist);
        }
    });
    new_label.textContent = sound;
    new_div.appendChild(new_option);
    new_div.appendChild(new_label);
    soundList.appendChild(new_div);
});

var count = 1;

function reset(){
    count = 1;
    playBtns.splice(0);
    playerList.splice(0);
    sequences.splice(0);
    while(chordList.firstChild){
        chordList.removeChild(chordList.firstChild);
    }
}

function chordMatchCount(chord,soundlist,root){
    var data = ChordData[chord];
    var count = 0;
    for(let i=0;i<soundlist.length;i++){
        let s=soundlist[i];
        //console.log(s);
        if(data.includes((s-root+12)%12)){
            //console.log(soundlist.indexOf((s+root)%12));
            count++;
        }else{
            //console.log("not included");
            //return false;
        }
    }
    return count;
}

function chordSuggestionCount(indList){
    reset();
    console.log("chordSuggestionCount");
    console.log(indList);
    if(indList.length==0){
        document.getElementById("output-text").textContent = "構成音が選択されていません";
        var sequence = {};;
        sequence.notes = [];
        sequence.totalTime = 1.0;
        //sequences.push(sequence);
        suggestRow(count,"None","-","N.C.","伴奏なし",sequence);
        count++;
    }else{
        document.getElementById("output-text").textContent = indList.map(ind => soundNameList[ind]).join(",") + "が含まれるChord一覧 (OR検索)";
    }
    var returnlist = []
    for(let i=0;i<soundNameList.length;i++){
        var str = '';
        for(var c in ChordData){
            //console.log('c:'+ c.toString());
            //console.log(Pitch[i] + c);
            if(chordMatchCount(c,indList,i)>0 || indList.length==0){
                var dic = {};
                //console.log(Pitch[i] + c);
                dic.base = soundNameList[i];
                dic.scale = c;
                dic.matchCount = chordMatchCount(c,indList,i);
                ChordData[c].forEach(l => {
                    str += soundNameList[(l+i)%12] +' ';
                });
                dic.pitches = str;
                dic.description = chordDescriptions[c];
                var sequence = mm.NoteSequence.create();
                ChordData[c].forEach(l=>{
                    sequence.notes.push({pitch: 60 + (l+i)%12, startTime: 0.0, endTime: 1.0});
                });
                sequence.notes.push({pitch: 36 + i, startTime: 0.0, endTime: 1.0});
                dic.sequence = sequence;
                returnlist.push(dic);
                
                str='';
                count++;
            }
        }
    }
    returnlist.sort((a,b)=>{
        return b.matchCount - a.matchCount;
    });
    console.log(returnlist);
    for(var i=1;i<=returnlist.length;i++){
        dic = returnlist[i-1];
        suggestRow(i,dic.base,dic.pitches,dic.scale,dic.description,dic.sequence);
    }
}

function chordMatch(chord,soundlist,root){
    //console.log(data);
    var data = ChordData[chord];
    if(soundlist.length==0)return false;
    for(let i=0;i<soundlist.length;i++){
        let s=soundlist[i];
        //console.log(s);
        if(data.includes((s-root+12)%12)){
            //console.log(soundlist.indexOf((s+root)%12));
        }else{
            //console.log("not included");
            return false;
        }
    }
    return true;
}

function suggestRow(number,base,sound,scale,description,sequence){
    var new_tr = document.createElement('tr');
    
    var new_number = document.createElement('td');
    new_number.classList.add("column1");
    new_number.textContent = number.toString();
    new_tr.appendChild(new_number);

    var new_base = document.createElement('td');
    new_base.classList.add("column2");
    new_base.textContent = base;
    new_tr.appendChild(new_base);
                
    var new_scale = document.createElement('td');
    new_scale.classList.add("column3");
    new_scale.textContent = scale;
    new_tr.appendChild(new_scale);

    var new_chord_sound = document.createElement('td');
    new_chord_sound.classList.add("column4");
    new_chord_sound.textContent = sound;
    new_tr.appendChild(new_chord_sound);

    var new_description = document.createElement('td');
    new_description.classList.add("column5");
    new_description.textContent = description;//ここに説明文を入れる
    new_tr.appendChild(new_description);
                    
    var new_button_td = document.createElement('td');
    new_button_td.classList.add("column6");

    sequences.push(sequence);
    
    var playBtn = document.createElement('button');
    playBtn.id = "record" + count.toString();
    playBtn.classList.add("button");
    playBtn.addEventListener('click', (e) => play_chord(e));
    playBtn.textContent = 'play';
    playBtns.push(playBtn);
        
    new_player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
    playerList.push(new_player);
    new_button_td.appendChild(playBtn);
    new_tr.appendChild(new_button_td);
    
    var new_set_button_td = document.createElement('td');
    new_set_button_td.classList.add("column7");
    var setBtn = document.createElement('button');
    setBtn.classList.add("button-set");
    setBtn.addEventListener('click',()=>{
        if(input != undefined){
            var idx = barNumberSelect.selectedIndex;
            if(base == 'None'){
                chordInputs[idx].value = 'N.C.';
            }else{
                chordInputs[idx].value = Pitch[soundNameList.indexOf(base)] + scale;
            }
        }
    });
    setBtn.textContent = 'set';

    new_set_button_td.appendChild(setBtn);
    new_tr.appendChild(new_set_button_td);

    chordList.appendChild(new_tr);
}


function chordSuggestionAnd(indList){
    reset();
    console.log("chordSuggestionAnd");
    console.log(indList);
    if(indList.length==0){
        document.getElementById("output-text").textContent = "構成音が選択されていません";
        var sequence = {};;
        sequence.notes = [];
        sequence.totalTime = 1.0;
        //sequences.push(sequence);
        suggestRow(count,"None","-","N.C.","伴奏なし",sequence);
        count++;
    }else{
        document.getElementById("output-text").textContent = indList.map(ind => soundNameList[ind]).join(",") + "が含まれるChord一覧 (AND検索)";
    }
    var returnlist = []
    for(let i=0;i<soundNameList.length;i++){
        var str = '';
        for(var c in ChordData){
            //console.log('c:'+ c.toString());
            //console.log(Pitch[i] + c);
            if(chordMatch(c,indList,i)){
                var dic = {};
                //console.log(Pitch[i] + c);
                dic.base = soundNameList[i];
                dic.scale = c;
                dic.matchCount = Math.abs(indList.length-ChordData[c].length);
                ChordData[c].forEach(l => {
                    str += soundNameList[(l+i)%12] +' ';
                });
                dic.pitches = str;
                dic.description = chordDescriptions[c];
                var sequence = mm.NoteSequence.create();
                ChordData[c].forEach(l=>{
                    sequence.notes.push({pitch: 60 + (l+i)%12, startTime: 0.0, endTime: 1.0});
                });
                sequence.notes.push({pitch: 36 + i, startTime: 0.0, endTime: 1.0});
                dic.sequence = sequence;
                returnlist.push(dic);
                
                str='';
                count++;
            }
        }
    }
    returnlist.sort((a,b)=>{
        if(a.matchCount!=b.matchCount){
            return a.matchCount - b.matchCount;
        }
    });
    console.log(returnlist);
    for(var i=1;i<=returnlist.length;i++){
        dic = returnlist[i-1];
        suggestRow(i,dic.base,dic.pitches,dic.scale,dic.description,dic.sequence);
    }
    return count++;
}

/*
function chordSuggestionAnd(indList){
    reset();
    console.log("chordSuggestionAnd");
    console.log(indList);
    if(indList.length==0){
        document.getElementById("output-text").textContent = "構成音が選択されていません";
        var sequence = {};;
        sequence.notes = [];
        sequence.totalTime = 1.0;
        //sequences.push(sequence);
        suggestRow(count,"None","-","N.C.","伴奏なし",sequence);
        count++;
    }else{
        document.getElementById("output-text").textContent = indList.map(ind => soundNameList[ind]).join(",") + "が含まれるChord一覧　(AND検索)";
    };
    for(let i=0;i<soundNameList.length;i++){
        for(var c in ChordData){
            //console.log('c:'+ c.toString());
            //console.log(Pitch[i] + c);
            var str = '';
            if(chordMatch(c,indList,i)){
                ChordData[c].forEach(l => {
                    //new_soundlist.textContent += Pitch[(l+i)%12] +' '
                    str += soundNameList[(l+i)%12] +' ';
                });
                //str = '';
                var sequence = mm.NoteSequence.create();
                ChordData[c].forEach(l=>{
                    sequence.notes.push({pitch: 60 + (l+i)%12, startTime: 0.0, endTime: 1.0});
                });
                sequence.notes.push({pitch: 36 + i, startTime: 0.0, endTime: 1.0});
                sequence.totalTime = 1.0;
                suggestRow(count,soundNameList[i],str,c,chordDescriptions[c],sequence);
                str = '';
                count++;
            }
        }
    }
    return count;
}
*/
function getSoundList(){
    const notelist = [];
    for(var i=0;i<document.form1.sound.length;i++){
        var s = document.form1.sound[i];
        if(s.checked){
            notelist.push(i);
        }
    }
    return notelist;
}

const andBtn = document.getElementById("search-and");
andBtn.addEventListener('click',()=>{
    searchType = true;
    console.log('andBtn clicked');
    chordSuggestionAnd(getSoundList());
  //chordSuggestionAnd(notelists[ind]);
});

const orBtn = document.getElementById("search-or");
orBtn.addEventListener('click',()=>{
    searchType = false;
    console.log('orBtn clicked');
    chordSuggestionCount(getSoundList());
  //chordSuggestionCount(notelists[ind]);
});

function chordSuggestion(indList){
    console.log("chordSuggestion");
    console.log(indList);
    searchType = true;
    if(chordSuggestionAnd(indList)==1){
        searchType = false;
        chordSuggestionCount(indList);
    }
    if(indList.length==0){
        document.getElementById("output-text").textContent = "この小節の先頭ではどの音も鳴らされていません";
    }
}

async function play_chord(event) {
    const btn = event.target;

    const playerIndex = playBtns.indexOf(btn);
    const mel = sequences[playerIndex];
    const player = playerList[playerIndex];
    
    new Promise(function(resolve,reject){
        //while(playerSaidStop==false){}
        startPlayer_chord(player,btn);
        player.start(mel);
        resolve();
    }).then(stopPlayer_chord(player, btn));
}

async function stopPlayer_chord(player, btn) {
    console.log('stopPlayer');
    player.stop();
    playerSaidStop = true;
    //btn.textContent = "play";
}
  
async function startPlayer_chord(player, btn) {
    console.log('startPlayer');
    playerSaidStop = false;
    //btn.textContent = "stop";
}