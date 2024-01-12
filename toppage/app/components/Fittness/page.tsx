"use client"

import React, { useEffect, useState } from 'react';
import { createDetector, SupportedModels, estimatePoses, movenet } from '@tensorflow-models/pose-detection';
import * as poseDetection from '@tensorflow-models/pose-detection';
interface UserData {
  name: string;
  age: number;
  sex: string;
  score: number;
}

const PoseDetectionApp: React.FC = () => {
  let detector: any;
  let detectorConfig: any;
  let poses: any;
  let video: any;
  let edges: any;
  let elbowAngle = 200;
  let upPosition = false;
  let downPosition = true;
  let highlightBack = false;
  let backWarningGiven = false;
  let ratio = 1.25;
  let weight = 1;
  let armAngle: number;

  const [score, setScore] = useState(0);
  const [highlightArm, setHighlightArm] = useState(false);
  const [highlightArmGiven, setHighlightArmGiven] = useState(false);
  const [formError, setFormError] = useState(false);
  const [reps,setReps] = useState(0)

  useEffect(() => {
    const init = async () => {
      detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
      detector = await createDetector(SupportedModels.MoveNet, detectorConfig);
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
    };

    init();
  }, []);

  const videoReady = async () => {
    // console.log('video ready');
  };

  const setup = async (p: any) => {
    p.createCanvas(800, 600);
    video = p.createCapture(p.VIDEO, videoReady);
    video.size(800, 600);
    video.hide();
  };

  const draw = (p: any) => {
    p.background(220);
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.image(video, 0, 0, video.width, video.height);

    drawKeypoints(p);
  };

  const getPoses = async () => {
    poses = await estimatePoses(video.elt);
    setTimeout(getPoses, 0);
  };

  const drawKeypoints = (p: any) => {
    let count = 0;
    if (poses && poses.length > 0) {
      for (let kp of poses[0].keypoints) {
        const { x, y, score } = kp;
        if (score > 0.3) {
          count = count + 1;
          p.fill(255);
          p.stroke(0);
          p.strokeWeight(4);
          p.circle(x * ratio, y * ratio, 16);
        }
        if (count === 17) {
          // console.log('Whole body visible!');
        } else {
          // console.log('Not fully visible!');
        }
        updateArmAngle();
        hilightArmAngle();
        inUpPositionElbow();
        inDownPositionElbow();
      }
    }
  };

  const updateArmAngle = () => {
    const leftWrist = poses[0].keypoints[9];
    const leftShoulder = poses[0].keypoints[5];
    const leftElbow = poses[0].keypoints[7];

    const angle =
      (Math.atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x) -
        Math.atan2(leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x)) *
      (180 / Math.PI);

    if (angle < 0) {
      elbowAngle = Math.abs(angle);
    }

    if (
      leftWrist.score > 0.3 &&
      leftElbow.score > 0.3 &&
      leftShoulder.score > 0.3
    ) {
      elbowAngle = angle;
    }
  };
  const hilightArmAngle = () => {
    const leftWrist = poses[0].keypoints[9];
    const leftShoulder = poses[0].keypoints[5];
    const angle =
      (Math.atan2(
        leftWrist.y - leftShoulder.y,
        leftWrist.x - leftShoulder.x
      ) -
        Math.atan2(
          video.height - leftShoulder.y,
          leftShoulder.x - leftShoulder.x
        )) *
      (180 / Math.PI);
    const absAngle = Math.abs(angle);

    if (leftWrist.score > 0.3 && leftShoulder.score > 0.3) {
      armAngle = absAngle;
      if (absAngle < 80 && absAngle > 0) {
        setHighlightArm(false);
      } else {
        setHighlightArm(true);
        if (highlightArm) {
          setHighlightArmGiven(true);
        }
      }
    }
  };

  const inUpPositionElbow = () => {
    if (Math.abs(elbowAngle) > 35 && Math.abs(elbowAngle) < 60) {
      if (!upPosition) {
        if (reps === 10) {
          var msg = new SpeechSynthesisUtterance('ステージクリア');
          window.speechSynthesis.speak(msg);
          // modal.style.display = 'block';
          // modalCover.style.display = 'block';
          // ScoreDom.innerHTML = score;
          // setTimeout(() => modal.classList.add('show'), 0);
        } else if (reps < 10) {
          var msg = new SpeechSynthesisUtterance('Down');
          window.speechSynthesis.speak(msg);
          if (highlightArmGiven) {
            setFormError(true);
          }
        }
      }
      downPosition = false;
      upPosition = true;
    }
  };

  const inDownPositionElbow = () => {
    if (Math.abs(elbowAngle) > 200 && Math.abs(elbowAngle) < 240) {
      if (!downPosition) {
        if (reps < 10) {
          var msg = new SpeechSynthesisUtterance(String(reps + 1));
          window.speechSynthesis.speak(msg);
          setReps(reps + 1);
          if (formError) {
            setScore(score + 10 * 0.7 * weight);
            var msg = new SpeechSynthesisUtterance('good');
            window.speechSynthesis.speak(msg);
          } else {
            setScore(score + 10 * weight);
            var msg = new SpeechSynthesisUtterance('great');
            window.speechSynthesis.speak(msg);
          }
          setFormError(false);
          setHighlightArm(false);
          setHighlightArmGiven(false);
        } else {
          setReps(reps + 1);
        }
      }
      upPosition = false;
      downPosition = true;
    }
  };

  const postData = async (e: React.FormEvent) => {
    e.preventDefault();
    const UserName = document.getElementById('first_name')?.value || '';
    const company = document.getElementById('company')?.value || '';
    const UserSex = document.getElementById('phone')?.value || '';
    const UserAge = document.getElementById('age')?.value || '';

    const param = {
      method: 'POST',
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
      console.log(newData);
      // setUserData(newData);
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  return (
    <div>
      {/* <p5
        sketch={sketch => {
          sketch.setup = () => setup(sketch);
          sketch.draw = () => draw(sketch);
        }}
      /> */}
      <form action="" className="feedback" onSubmit={postData}>
        <button className="Form_submit" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PoseDetectionApp;
