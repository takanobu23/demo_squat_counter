"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'

interface UserData {
  name: string;
  age: number;
  sex: string;
  score: number;
}

const UserScores: React.FC<{ data: Record<string, UserData> }> = ({ data }) => {
  const dataArray = Object.entries(data).map(([userId, userData]) => ({
    userId,
    ...userData,
  }));

  const sortedData = dataArray.slice().sort((a, b) => b.score - a.score);
  
  return (
    <div className='w-10/12 mx-auto'>
      <ul className='text-start'>
        {sortedData.map((user, index) => (
          <li key={user.userId}>
            {index == 0 ? <div className='flex align-middle w-full mb-4'><Image alt='ランク1' width={50} height={50} src={"rank1.svg"} className='w-12 h-12'/><p className='text-4xl/[50px] text-right'>{user.name}  スコア{user.score}</p></div> : index == 1 ? <div className='flex align-middle w-full mb-4'><Image alt='ランク2' width={50} height={50} src={"rank2.svg"} className='w-12 h-12'/><p className='text-4xl/[50px] text-right '>{user.name}  スコア{user.score}</p></div> : index == 2 ? <div className='flex align-middle w-full mb-4'><Image alt='ランク3' width={50} height={50} src={"rank3.svg"} className='w-12 h-12'/><p className='text-4xl/[50px] text-center '>{user.name}  スコア{user.score}</p></div>: <div className='flex align-middle w-full mb-4'><p className='w-12 text-5xl text-center font-light  h-40'>{index+1}</p><p className='text-4xl/[50px] text-center '>{user.name}  スコア{user.score}</p></div>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Rank: React.FC = () => {
  const [userData, setUserData] = useState<Record<string, UserData>>({});

  useEffect(() => {
    // データを非同期でフェッチ
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/post'); // APIのエンドポイントに置き換える
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // 空の依存配列を渡すことで、初回のみフェッチが行われる


  return <UserScores data={userData} />;
};

const Ranking = () => {

  return (
    <div className='ml-drawer mt-10 text-center '>
      <div className='main'>
      <div className='flex gap-2.5 mb-10'>
      <Image 
      alt='リーグ'
      width={100}
      height={100}
      src={"./leag_BIG.svg"}
      />
      <Image 
      alt='リーグ'
      width={100}
      height={100}
      src={"./leag_undefind.svg"}
      />
      <Image 
      alt='リーグ'
      width={100}
      height={100}
      src={"./leag_undefind.svg"}
      />
      <Image 
      alt='リーグ'
      width={100}
      height={100}
      src={"./leag_undefind.svg"}
      />
      <Image 
      alt='リーグ'
      width={100}
      height={100}
      src={"./leag_undefind.svg"}
      />
      </div>
      <h3 className='font-medium text-6xl mb-6'>BIGリーグ</h3>
      <p className='font-medium text-3xl mb-6'>現在のランキング</p>
      <Rank />
    </div>
    <div></div>
  </div>
  )
}

export default Ranking