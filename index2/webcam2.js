let detector;
let detectorConfig;
let poses;
let video;
let skeleton = true;
let model;
let elbowAngle = 999;
let backAngle = 0;
let reps = 0;
let upPosition = false;
let downPosition = false;
let highlightBack = false;
let backWarningGiven = false;

var count = 0;
var timeoutId;


//スクワット用変数
let left_hip
let left_knee
let left_ankle

let knee_angle

let knee_hip_pos

let ratio = 1.25

async function init() {
  detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  edges = {
    '0,0':"m",
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
  var msg = new SpeechSynthesisUtterance('体全体を四角の中に収めてください');
  window.speechSynthesis.speak(msg);
  createCanvas(800, 600);
  video = createCapture(VIDEO, videoReady);
  video.size(800,600);
  video.hide()

  await init();
}

async function getPoses() {
  poses = await detector.estimatePoses(video.elt);
  // console.log(poses)
  setTimeout(getPoses, 0);
  //console.log(poses);
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

  if (5000 < timeoutId) {
    fill(255, 0, 0);
    textSize(100);
    text('準備完了', width / 2, height / 2);
    location.href = "http://127.0.0.1:5500/index.html"
    // setTimeout(() => {
    //   location.href('index.html')
    // }, 2000);
  }
  else {
    fill(255, 0, 0);
    textSize(20);
    text('Loading, please wait...', 100, 90);
  }
  
}

// function drawKeypoints() {
//   var count = 0;
//   if (poses && poses.length > 0) {
//     for (let kp of poses[0].keypoints) {
//       const { x, y, score } = kp;
//       if (score > 0.3) {
//         count = count + 1;
//       }
//       if (count == 17) {
//         //console.log('Whole body visible!');
//       }
//       else {
//         //console.log('Not fully visible!');
//       }
//       // updateArmAngle();
//       // updateBackAngle();
//       // inUpPosition();
//       // inDownPosition();

//     }
//   }
// }

function drawKeypoints() {
  if (poses && poses.length > 0) {
    count = 0
    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.3) {
        count = count + 1;
      }
      console.log(count)
      if (poses[0].keypoints[13].score > 0.3) {
        console.log('Whole body visible!');
        // カウントが3秒以上続いたら別の画面に遷移
        if (timeoutId) {
          clearTimeout(timeoutId); // タイマーをリセット
        }
        timeoutId = setTimeout(() => {
          console.log('Transition to another screen!');
          strokeWeight(2);
          stroke(51);
          textSize(40);
          translate(width, 0)
          text("準備完了", 100, 90);
        }, 5000);
      } else {
        console.log('Not fully visible!');
        
        // カウントが17でない場合はタイマーをリセット
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }

      // updateArmAngle();
      // updateBackAngle();
      // inUpPosition();
      // inDownPosition();
    }
  }
}



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
          strokeWeight(10);
          stroke(255, 0, 0);
          line(x1*ratio, y1*ratio, x2*ratio, y2*ratio);
        } else if (p1 == 0){
          fill('rgb(0, 255, 0)')
          circle(x1*ratio, y1*ratio,75)
          line(x1*ratio, y1*ratio, x2*ratio, y2*ratio);
        }
        else {
          strokeWeight(10);
          stroke('rgb(0, 255, 0)');
          line(x1*ratio, y1*ratio, x2*ratio, y2*ratio);
        }
      }
    }
  }
}
