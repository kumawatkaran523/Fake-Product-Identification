import React from 'react'
import Navbar from '../components/Navbar'

function Home() {
  return (
    <div>
        <Navbar/>
        <div className='grid grid-cols-2'>
            <div className=' ml-36 my-60'>
              <img src='/Verified_logo.png' alt="" width={400} height={400}/>
              <p className=' text-4xl font-bold my-6'>Empowering Authenticity, One Scan at a Time.</p>
              <p className=' text-xl text-gray-400'>A Blockchain based application for detecting Counterfeit product in the B2C and B2B supply chain which will benefit bussiness in term of growth,reputation,trust and to customers in getting genuine product in hand</p>
            </div>
            <div>
              <img src='/scannerHand.png' alt="" width={1000} height={1000} loading='lazy'/>
            </div>
        </div>
    </div>
  )
}

export default Home