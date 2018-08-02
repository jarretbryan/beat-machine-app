document.addEventListener("DOMContentLoaded", ()=>{

  let steps = []

  function instantiateSteps() {
    let count = 1
    while (count <= 16) {
      steps.push(new Step(count))
      count++
    }
  }

  instantiateSteps()

  let playback;
  let loadedDrumKit;
  loadDrumKit('trap')
  let currentTempo = 120
  let stepCount = 1
  let currentShuffle = 0.0

  // let drumKit = {
  //   kick: 'audio/LF_kick_08.wav',
  //   snare: 'audio/LF_snare_01.wav',
  //   hiHatClosed: 'audio/LF_hihat_closed_05.wav',
  //   hiHatOpen: 'audio/LF_hihat_open_03.wav'
  // }

  // let drumKit = {
  //   kick:'audio/Roland TR-808/Bassdrum-05.wav',
  //   snare:'audio/Roland TR-808/Snaredrum.wav',
  //   ohat:'audio/Roland TR-808/Hat Open.wav',
  //   chat:'audio/Roland TR-808/Hat Closed.wav',
  //   rimshot:'audio/Roland TR-808/Rimshot.wav',
  //   tomH:'audio/Roland TR-808/Tom H.wav',
  //   tomM:'audio/Roland TR-808/Tom M.wav',
  //   tomL:'audio/Roland TR-808/Tom L.wav',
  //   cowBell: 'audio/Roland TR-808/Cowbell.wav',
  //   clap: 'audio/Roland TR-808/Clap.wav'
  // }

  // let drumKit = {
  //   kick:'audio/Roland TR-909/Bassdrum-03.wav',
  //   snare:'audio/Roland TR-909/Clap.wav',
  //   ohat:'audio/Roland TR-909/Hat Open.wav',
  //   chat:'audio/Roland TR-909/Hat Closed.wav',
  // }
  //
  // function instantiateDrumKit(drumKit){
  //   for (let instrument in drumKit){
  //     let sampleObjects = []
  //     let count = 1
  //     while (count <= 16) {
  //       sampleObjects.push(new Audio(drumKit[instrument]))
  //       count++
  //     }
  //     drumKit[instrument] = sampleObjects
  //   }
  //   return drumKit
  // }

  function loadDrumKit(name) {
    loadedDrumKit = new DrumKit(name)
  }

  function addNoteToSequence(instrument, stepNum) {
    new Note(instrument, steps[stepNum - 1])
  }

  function removeNoteFromSequence(instrument, stepNum) {
    let targetIndex;
    let notes = steps[stepNum - 1].notes
    for (let i = 0; i < notes.length; i++){
      if (notes[i].instrument === instrument) {targetIndex = i; break;};
    }
    notes.splice(targetIndex, 1)
  }

  // function changeVolumeOfInstrument(instrument, level) {
  //   loadedDrumKit[instrument].forEach(audioEl=>audioEl.volume = level)
  // }

  function parseTempo(currentTempo) {
    return (60000 / currentTempo) / 4
  }

  function shuffleOffset() {
    if (stepCount % 2 === 0) {
      return 1 + currentShuffle
    } else {
      return 1 - currentShuffle
    }
  }

  function parseShuffle(currentShuffle) {
    return Math.round(currentShuffle * 100)
  }

  function incrementTempo(){
    if (currentTempo < 150){
    currentTempo += 1
    $("#tempo-screen").sevenSeg({ value: currentTempo});
    }
  }

  function  decrementTempo(){
    if (currentTempo > 60){
    currentTempo -= 1
    $("#tempo-screen").sevenSeg({ value: currentTempo});
    }
  }

  function incrementShuffle(){
    if (currentShuffle < 0.50){
    currentShuffle = (Math.round(currentShuffle * 100) + 1) / 100
    $("#shuffle-screen").sevenSeg({ value: parseShuffle(currentShuffle) || '0'});
    }
  }

  function decrementShuffle(){
    if (currentShuffle > 0){
    currentShuffle = (Math.round(currentShuffle * 100) - 1) / 100
    $("#shuffle-screen").sevenSeg({ value: parseShuffle(currentShuffle) || '0'});
    }
  }

  function startPlay() {
    playback = setTimeout(function playBeats() {
      console.log(stepCount);
      steps[stepCount - 1].notes.forEach(function(note) {
        loadedDrumKit[note.instrument][stepCount - 1].play()
      })
      if (stepCount === 16){
        advanceLights()
        stepCount = 1
      } else {
        advanceLights()
        stepCount++
      }
      playback = setTimeout(playBeats, (parseTempo(currentTempo) * shuffleOffset()));
    }, (parseTempo(currentTempo)));
  }

  function stopPlay() {
    clearTimeout(playback)
    // stepCount = 1 // resets sequence to beginning
  }

  function advanceLights() {
    let previousLight;
    if (stepCount === 1){
      previousLight = document.querySelector(`#status-light-16`)
    } else {
      previousLight = document.querySelector(`#status-light-${stepCount - 1}`)
    }
    if (previousLight.className.includes('lit')){
      previousLight.className = 'status-light'
    }
    let currentLight = document.querySelector(`#status-light-${stepCount}`)
    currentLight.className += '-lit'
  }

  $("#tempo-screen").sevenSeg({ digits: 3, value: currentTempo, decimalPoint: false, allowInput: false, colorOn: "#f98e6d", colorOff: "#621a04"});

  $("#shuffle-screen").sevenSeg({ digits: 3, value: parseShuffle(currentShuffle) || '0', decimalPoint: false, allowInput: false, colorOn: "#f98e6d", colorOff: "#621a04"});

  const rootDiv = document.getElementById('main-container')

  const playButton = document.getElementById('play-button')
  const stopButton = document.getElementById('stop-button')

  const tempoUpButton = document.getElementById('tempo-up-button')
  const tempoDownButton = document.getElementById('tempo-down-button')

  const shuffleUpButton = document.getElementById('shuffle-up-button')
  const shuffleDownButton = document.getElementById('shuffle-down-button')

  rootDiv.addEventListener("click", function(event){

    if (event.target.className.includes('sequencer-button')){

      if (event.target.className.includes('lit')){
        let classNameArray = event.target.className.split('-')
        classNameArray.length -= 1
        event.target.className = classNameArray.join('-')

        let instrument = event.target.id.split('-')[0]
        let stepNum = Number(event.target.id.split('-')[1])
        removeNoteFromSequence(instrument, stepNum)

      } else {
        event.target.className += '-lit'

        let instrument = event.target.id.split('-')[0]
        let stepNum = Number(event.target.id.split('-')[1])
        addNoteToSequence(instrument, stepNum)

      }
    }

    if (event.target.dataset.action === 'play') {
      if (playButton.className === "play-button"){playButton.className = "play-button-lit"; stopButton.className = "stop-button"; startPlay()}
      else {playButton.className = "play-button"; stopButton.className = "stop-button-lit"; stopPlay()}
    }
    if (event.target.dataset.action === 'stop') {
      if (stopButton.className === "stop-button"){stopButton.className = "stop-button-lit"; playButton.className = "play-button"; stopPlay()}
    }
    if (event.target.dataset.action === 'tempo-up') {
      tempoUpButton.className = "tempo-up-button-lit"
      setTimeout(()=>{tempoUpButton.className = "tempo-up-button"}, 300)
      incrementTempo()
    }
    if (event.target.dataset.action === 'tempo-down') {
      tempoDownButton.className = "tempo-down-button-lit"
      setTimeout(()=>{tempoDownButton.className = "tempo-down-button"}, 300)
      decrementTempo()
    }
    if (event.target.dataset.action === "shuffle-up"){
      shuffleUpButton.className = "shuffle-up-button-lit"
      setTimeout(()=>{shuffleUpButton.className = "shuffle-up-button"}, 300)
      incrementShuffle()
    }
    if (event.target.dataset.action === "shuffle-down"){
      shuffleDownButton.className = "shuffle-down-button-lit"
      setTimeout(()=>{shuffleDownButton.className = "shuffle-down-button"}, 300)
      decrementShuffle()
    }

  })

  document.body.addEventListener('keyup', function(event) {
    if (event.code === 'Space'){
      event.preventDefault()
      if (playButton.className === "play-button"){playButton.className = "play-button-lit"; stopButton.className = "stop-button"; startPlay()}
      else {playButton.className = "play-button"; stopButton.className = "stop-button-lit"; stopPlay()}
    }
  })

  document.body.addEventListener('keydown', function(event){
    if (event.code === 'ArrowUp'){
      event.preventDefault()
      tempoUpButton.className = "tempo-up-button-lit"
      setTimeout(()=>{tempoUpButton.className = "tempo-up-button"}, 300)
      incrementTempo()
    }
    if (event.code === 'ArrowDown'){
      event.preventDefault()
      tempoDownButton.className = "tempo-down-button-lit"
      setTimeout(()=>{tempoDownButton.className = "tempo-down-button"}, 300)
      decrementTempo()
    }
    if (event.code === 'ArrowRight'){
      event.preventDefault()
      shuffleUpButton.className = "shuffle-up-button-lit"
      setTimeout(()=>{shuffleUpButton.className = "shuffle-up-button"}, 300)
      incrementShuffle()
    }
    if (event.code === 'ArrowLeft'){
      event.preventDefault()
      shuffleDownButton.className = "shuffle-down-button-lit"
      setTimeout(()=>{shuffleDownButton.className = "shuffle-down-button"}, 300)
      decrementShuffle()
    }
  })

// function startPlay() {
//   playback = setInterval(playBeats, parseTempo(currentTempo))
// }
// function stopPlay() {
//   clearInterval(playback)
//   stepCount = 1 // resets sequence to beginning
// }
//
// function playBeats() {
//   // console.log(stepCount);
//
//   steps[stepCount - 1].notes.forEach(function(note) {
//     note.audio.play()
//   })
//   if (stepCount === 16){
//     stepCount = 1
//   } else {
//     stepCount++
//   }
// }

// addNoteToSequence('kick', 0)
// addNoteToSequence('hiHatOpen', 2)
// addNoteToSequence('snare', 4)
// addNoteToSequence('kick', 6)
// addNoteToSequence('kick', 8)
// addNoteToSequence('kick', 11)
// addNoteToSequence('snare', 12)
// addNoteToSequence('kick', 13)
// addNoteToSequence('kick', 13)
// addNoteToSequence('kick', 14)
// addNoteToSequence('kick', 15)
// addNoteToSequence('hiHatClosed', 0)
// addNoteToSequence('hiHatClosed', 7)
// addNoteToSequence('hiHatClosed', 8)
// addNoteToSequence('hiHatClosed', 9)
// addNoteToSequence('hiHatClosed', 10)
// addNoteToSequence('hiHatClosed', 11)
// addNoteToSequence('hiHatClosed', 12)
// addNoteToSequence('hiHatClosed', 13)
// addNoteToSequence('hiHatClosed', 14)
// addNoteToSequence('hiHatClosed', 15)
// addNoteToSequence('rimshot', 3)
// addNoteToSequence('rimshot', 6)
// addNoteToSequence('rimshot', 8)
// addNoteToSequence('rimshot', 11)
// addNoteToSequence('rimshot', 12)
// addNoteToSequence('tomH', 5)
// addNoteToSequence('tomH', 8)
// addNoteToSequence('tomM', 13)
// addNoteToSequence('tomM', 14)
// addNoteToSequence('tomL', 15)
// addNoteToSequence('cowBell', 9)
// addNoteToSequence('cowBell', 12)
// addNoteToSequence('clap', 3)
// addNoteToSequence('clap', 6)

// addNoteToSequence('kick', 0)
// addNoteToSequence('kick', 4)
// addNoteToSequence('kick', 8)
// addNoteToSequence('kick', 12)
// addNoteToSequence('hiHatClosed', 1)
// addNoteToSequence('hiHatOpen', 2)
// addNoteToSequence('clap', 4)

})
