// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
A game using pitch Detection with CREPE
=== */

// Crepe variables
let crepe;
const voiceLow = 100;
const voiceHigh = 500;
let audioStream;
let fft;

// Circle variables
let circleSize = 42;
const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Text variables
let goalNote = 0;
let currentNote = '';
let currentText = '';
let textCoordinates;

function createCrepe() {
  crepe = ml5.pitchDetection('Crepe', getAudioContext(), audioStream.stream);
  loop();
}

function getNoteFromMidiNum(midiNum) {
  let note = scale[midiNum % 12];
  return note;
}

function setup() {
  createCanvas(1200, 600);
  gameReset();
  textCoordinates = [width / 2, 30];
  textAlign(CENTER);
  noLoop();
  audioStream = new p5.AudioIn(function(err) {
    console.error(err);
  });
  audioStream.start(createCrepe, function(err) {
    console.error(err);
  });
  fft = new p5.FFT();
}

function parse(result) {
  let splitResult = result.split(" Hz");
  return float(splitResult[0])
}

function gameReset() {
  goalNote = round(random(0, scale.length - 1));
  loop();
}

function hit(goalHeight, note) {
  noLoop();
  background(240);
  fill(138, 43, 226);
  ellipse(width / 2, goalHeight, circleSize, circleSize);
  textSize(18);
  fill(255);
  text(note, width / 2, goalHeight + (circleSize / 6));
  fill(50);
  textSize(100);
  text("Hooray!", textCoordinates[0], textCoordinates[1] + 80);
  setTimeout(gameReset, 3000);
}

function drawCircles() {
  noStroke();
  // Goal Circle
  fill(255, 0, 0);
  goalHeight = map(goalNote, 0, scale.length - 1, height - 100, 150);
  ellipse(width / 2, goalHeight, circleSize, circleSize);
  fill(255);
  text(scale[goalNote], (width / 2), goalHeight + (circleSize / 6));
  // Pitch Circle
  if (currentNote != '') {
    fill(0, 0, 255);
    currentHeight = map(scale.indexOf(currentNote), 0, scale.length - 1, height - 100, 150);
    ellipse(width / 2, currentHeight, circleSize, circleSize);
    fill(255);
    text(scale[scale.indexOf(currentNote)], width / 2, currentHeight + (circleSize / 6));
    // If target is hit
    if (dist(width / 2, currentHeight, width / 2, goalHeight) < circleSize / 2) {
      hit(goalHeight, scale[goalNote]);
    }
  }
}

function drawText() {
  fill(50);
  noStroke();
  textSize(18);
  text("Hum or sing to hit the right pitch! Notes will match no matter the octave.", textCoordinates[0], textCoordinates[1]);
  text(currentText, textCoordinates[0], textCoordinates[1] + 35);
  if (currentNote != '') {
    text("NOTE: " + currentNote, textCoordinates[0], textCoordinates[1] + 35);
  }
}

function draw() {
  background(240);
  if (!crepe) {
    console.log("Crepe not yet initialized");
    return;
  }
  let results = crepe.getResults();
  if (results) {
    if (results['result'] == "no voice") {
      currentText = 'No input detected';
      currentNote = '';
    } else {
      result = parse(results['result']);
      currentText = '';
      currentFreq = result;
      let midiNum = freqToMidi(result);
      currentNote = getNoteFromMidiNum(midiNum);
    }
  }
  drawText();
  drawCircles();
}
