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
let downPosition = true;
let highlightBack = false;
let backWarningGiven = false;
let ratio = 1.25

let weight = 1
let penaltyPoint = 0.7

let armAngle

let FormError = false

let score = 0

let highlightArm = false
let highlightArmGiven = false;
let armPenalty = false


// モーダル用DOM
const feedbackBtn = document.querySelector('.feedback-btn');
const modal = document.querySelector('.modal');
const modalCover = document.querySelector('.bg_black');
const ScoreDom =  document.querySelector('.ArmcallScore');

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
      hilightArmAngle();
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
    elbowAngle = angle;
  }
}

function hilightArmAngle() {
  let leftWrist = poses[0].keypoints[9];
  let leftShoulder = poses[0].keypoints[5];
  // let lefthip = poses[0].keypoints[11];

  angle = (
    Math.atan2(
      leftWrist.y - leftShoulder.y,
      leftWrist.x - leftShoulder.x
    ) - Math.atan2(
      height - leftShoulder.y,
      leftShoulder.x - leftShoulder.x
    )
  ) * (180 / Math.PI);
  angle = abs(angle)
  // console.log(`規制時の方の角度　：${angle}`)
  if (leftWrist.score > 0.3 && leftShoulder.score > 0.3) {
    armAngle = angle;
    if ((armAngle < 80) && (armAngle > 0)) {
      highlightArm = false;
    }
    else {
      // console.log(`腕上がりすぎな時のハイライトアーム　：　　${armAngle}`)
      highlightArm = true;
      if (highlightArm){
        highlightArmGiven = true
      }
    }
  }
}

function inUpPositionElbow() {
  if ((abs(elbowAngle) > 35) && (abs(elbowAngle) < 60)) {
    if (upPosition == false) {
      if (10 == reps){
        // console.log(`肘の角度 上がってる時: ${elbowAngle}`)
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
        if (highlightArmGiven) {
          FormError = true
        }
      } else {
        
      }
    }
    downPosition = false;
    upPosition = true;
  }
}

// DownElbowPos
function inDownPositionElbow() {
  if ((abs(elbowAngle) > 200) && (abs(elbowAngle) < 240)) {
    // console.log(`肘の角度 下がってる時: ${elbowAngle}`)
    // console.log('In up position')
    if (downPosition == false) {
      if (10 == reps){
      } else if (reps<10) {
        var msg = new SpeechSynthesisUtterance(str(reps+1));
        window.speechSynthesis.speak(msg);
        reps = reps + 1;
        if (FormError) {
          score = score + 10 * penaltyPoint * weight
          console.log(`エラー時のスコア : ${score}`)
          var msg = new SpeechSynthesisUtterance("good");
        window.speechSynthesis.speak(msg);
        } else {
          score = score +10 * weight
          console.log(`そうじゃない時 : ${score}`)
          var msg = new SpeechSynthesisUtterance("great");
          window.speechSynthesis.speak(msg);
        }
        FormError = false
        highlightArm = false
        highlightArmGiven=false
      } else {
        reps = reps + 1;
      }
    }
    upPosition = false;
    downPosition = true;
  }
}

// 送信用関数
const postData = async (e) => {
  e.preventDefault();
  const UserName = document.getElementById("first_name").value;
  const company = document.getElementById("company").value;
  const UserSex = document.getElementById("phone").value;
  const UserAge = document.getElementById("age").value;
  const message = document.getElementById("message").value;
  console.log(UserName,company,UserSex,UserAge,score)
  let param = {
    method: "POST",
    body: JSON.stringify({
      name: UserName,
      age: UserAge,
      sex: UserSex,
      score: score,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
};
  try {
    const response = await fetch('http://localhost:3000/post', param);
    const newData = await response.json();
    console.log(newData)
    // setUserData(newData);
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

const Form_submit = document.querySelector('.Form_submit')
Form_submit.addEventListener("click",postData)
