"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'

interface Person {
  name: string;
  age: number;
  sex: string;
  score: number;
}

const Ranking = () => {
  interface FetchRequest {
    url: string
    options: object
  }

  const initialData: Person[] = [
    {
      "name": "John Doe",
      "age": 25,
      "sex": "male",
      "score": 100
    },
    {
      "name": "Jane Doe",
      "age": 20,
      "sex": "female",
      "score": 10
    }
  ];

  const [data, setData] = useState<Person[]>(initialData);

  async function fetchAsync (request: FetchRequest): Promise<string> {
    return await fetch(request.url, request.options)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
  
        return await response.blob()
      })
      .then(async (response) => {
        return await response.text()
      })
  }
  
  async function main (): Promise<void> {
    const result = await fetchAsync({
      url: 'https://my-json-server.typicode.com/takanobu23/demo_squat_counter/userData',
      options: {}
    })
    console.log(result)
    setData(result)
  }
  
  main().catch((error) => {
    console.error(error)
  })

  

  useEffect(() => {
    // const sortedData = data.slice().sort((a, b) => b.score - a.score);
    // ソートされたデータから名前を取得
    // const sortedNames = sortedData.map(item => item.name);
    data.map(d => console.log(d))
    console.log();
  },[data])

  return (
    <div className='ml-drawer'>
      <div className='main'>
      <div className='flex gap-2.5'>
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
      <h3 className='font-medium text-6xl'>BIGリーグ</h3>
      <p className='font-medium text-3xl'>現在のランキング</p>
    </div>
    <div></div>
  </div>
  )
}

export default Ranking