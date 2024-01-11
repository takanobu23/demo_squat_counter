let detector;
let detectorConfig;
let poses;
let video;
let skeleton = true;
let model;
let elbowAngle = 200;
let backAngle = 0;
let reps = 0;
let upPosition = false;
let downPosition = false;
let highlightBack = false;
let backWarningGiven = false;
let ratio = 1.25

let score = 0


// モーダル用DOM
const feedbackBtn = document.querySelector('.feedback-btn');
const modal = document.querySelector('.modal');
const modalCover = document.querySelector('.bg_black');
const ScoreDom =  document.querySelector('.score');

async function init() {
  detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  edges = {
    '5,7': 'm',
    '7,9': 'm',
    '6,8': 'c',
    '8,10': 'c',
    '5,6': 'y',
    '5,11': 'm',
    '6,12': 'c',
    '11,12': 'y',
    '11,13': 'm',
    '13,15': 'm',
    '12,14': 'c',
    '14,16': 'c'
  };
  await getPoses();
}

async function videoReady() {
  //console.log('video ready');
}

async function setup() {
  var msg = new SpeechSynthesisUtterance('Loading, please wait...');
  window.speechSynthesis.speak(msg);
  createCanvas(800, 600);
  video = createCapture(VIDEO, videoReady);
  video.size(800,600);
  video.hide()

  await init();
}

async function getPoses() {
  poses = await detector.estimatePoses(video.elt);
  setTimeout(getPoses, 0);
}

function draw() {
  background(220);
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  // Draw keypoints and skeleton
  drawKeypoints();
  if (skeleton) {
    drawSkeleton();
  }

  // Write text
  fill("black");
  strokeWeight(2);
  stroke(51);
  translate(width, 0);
  scale(-1, 1);
  textSize(40);

  if (poses && poses.length > 0) {
    strokeWeight(2);
    stroke(51);
    textSize(40);
    translate(width/1.3, 0);
    let pushupString = `${reps}回`;
    text(pushupString, 100, 90);
  }
  else {
    text('Loading, please wait...', 100, 90);
  }
  
}

function drawKeypoints() {
  var count = 0;
  if (poses && poses.length > 0) {
    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.3) {
        count = count + 1;
        fill(255);
        stroke(0);
        strokeWeight(4);
        circle(x*ratio, y*ratio, 16);
      }
      if (count == 17) {
        //console.log('Whole body visible!');
      }
      else {
        //console.log('Not fully visible!');
      }
      updateArmAngle();
      inUpPositionElbow()
      inDownPositionElbow()
    }
  }
}

// Draws lines between the keypoints
function drawSkeleton() {
  confidence_threshold = 0.5;

  if (poses && poses.length > 0) {
    for (const [key, value] of Object.entries(edges)) {
      const p = key.split(",");
      const p1 = p[0];
      const p2 = p[1];

      const y1 = poses[0].keypoints[p1].y;
      const x1 = poses[0].keypoints[p1].x;
      const c1 = poses[0].keypoints[p1].score;
      const y2 = poses[0].keypoints[p2].y;
      const x2 = poses[0].keypoints[p2].x;
      const c2 = poses[0].keypoints[p2].score;

      if ((c1 > confidence_threshold) && (c2 > confidence_threshold)) {
        if ((highlightBack == true) && ((p[1] == 11) || ((p[0] == 6) && (p[1] == 12)) || (p[1] == 13) || (p[0] == 12))) {
          strokeWeight(3);
          stroke(255, 0, 0);
          line(x1*ratio, y1*ratio, x2*ratio, y2*ratio);
        }
        else {
          strokeWeight(2);
          stroke('rgb(0, 255, 0)');
          line(x1*ratio, y1*ratio, x2*ratio, y2*ratio);
        }
      }
    }
  }
}

function updateArmAngle() {
  /*
  rightWrist = poses[0].keypoints[10];
  rightShoulder = poses[0].keypoints[6];
  rightElbow = poses[0].keypoints[8];
  */
  leftWrist = poses[0].keypoints[9];
  leftShoulder = poses[0].keypoints[5];
  leftElbow = poses[0].keypoints[7];



  angle = (
    Math.atan2(
      leftWrist.y - leftElbow.y,
      leftWrist.x - leftElbow.x
    ) - Math.atan2(
      leftShoulder.y - leftElbow.y,
      leftShoulder.x - leftElbow.x
    )
  ) * (180 / Math.PI);

  if (angle < 0) {
    angle = Math.abs(angle)
  }

  if (leftWrist.score > 0.3 && leftElbow.score > 0.3 && leftShoulder.score > 0.3) {
    //console.log(angle);
    elbowAngle = angle;
  }
  else {
    //console.log('Cannot see elbow');
  }

}

function updateBackAngle() {

  var leftShoulder = poses[0].keypoints[5];
  var leftHip = poses[0].keypoints[11];
  var leftKnee = poses[0].keypoints[13];

  angle = (
    Math.atan2(
      leftKnee.y - leftHip.y,
      leftKnee.x - leftHip.x
    ) - Math.atan2(
      leftShoulder.y - leftHip.y,
      leftShoulder.x - leftHip.x
    )
  ) * (180 / Math.PI);
  angle = angle % 180;
  if (leftKnee.score > 0.3 && leftHip.score > 0.3 && leftShoulder.score > 0.3) {

    backAngle = angle;
  }

  if ((backAngle < 20) || (backAngle > 160)) {
    highlightBack = false;
  }
  else {
    highlightBack = true;
    if (backWarningGiven != true) {
      var msg = new SpeechSynthesisUtterance('Keep your back straight');
      window.speechSynthesis.speak(msg);
      backWarningGiven = true;
    }
  }

}

function inUpPositionElbow() {
  if ((abs(elbowAngle) > 35) && (abs(elbowAngle) < 60)) {
    if (upPosition == false) {
      if (10 == reps){
        var msg = new SpeechSynthesisUtterance('ステージクリア');
        window.speechSynthesis.speak(msg);
        modal.style.display = 'block';
        modalCover.style.display = 'block';
        ScoreDom.innerHTML = score
        setTimeout(() => modal.classList.add('show'), 0)
      } else if (reps<10) {
        var msg = new SpeechSynthesisUtterance('Down');
        window.speechSynthesis.speak(msg);
        console.log(reps)
      } else {
        
      }
    }
    downPosition = false;
    upPosition = true;
  }
}

// スクワットアップポジション
function inDownPositionElbow() {
  if ((abs(elbowAngle) > 200) && (abs(elbowAngle) < 240)) {
    // console.log('In up position')
    if (downPosition == false) {
      if (10 == reps){
      } else if (reps<10) {
        var msg = new SpeechSynthesisUtterance(str(reps+1));
        window.speechSynthesis.speak(msg);
        reps = reps + 1;
        score += 10
      } else {
        reps = reps + 1;
      }
    }
    upPosition = false;
    downPosition = true;
  }
}
