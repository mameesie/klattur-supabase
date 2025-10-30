import MoodPeopleGlasses from '@/public/svg/MoodPeopleGlasses'
import React from 'react'

function page() {
  return (
      <div className="flex justify-evenly">
      <div className="flex items-center w-[50%]">
        <MoodPeopleGlasses />
      </div>
      <div className="flex flex-col  w-[50%] justify-center items-start">
        <div className="flex flex-col items-center ml-[10px] mb-[11px] sm:mb-[14px] sm:ml-[18px] md:mb-[20px] md:ml-[30px] lg:mb-[30px] lg:ml-[40px] xl:mb-[38px] xl:ml-[50px]">
          <h1 className="font-no-name-regular text-blue text-[18px] py-[8px] xs:text-[28px] leading-tight sm:text-[38px] md:text-[44px] md:py-[14px] lg:text-[64px] xl:text-[83px] xl:py-[22px]">
            Clear your <br /> mind clutter <br /> and get rest
          </h1>
          <a href="/boek" className="bg-yellow-button font-open-sans-semibold text-dark-blue text-center text-[14px] rounded-[2000px] w-[150px] py-[4px] px-[15px] md:text-[20px] md:w-[200px]  xl:text-[30px] xl:w-[320px]">
            Boek een coach
          </a>
          <a href="/chat" className="bg-yellow-button font-open-sans-semibold text-dark-blue text-center text-[14px] rounded-[2000px] w-[180px] py-[4px] px-[15px] mt-[10px] md:text-[20px] md:w-[260px] md:mt-[15px] xl:text-[30px] xl:mt-[20px] xl:w-[395px]">
            Gedachten onderzoek
          </a>
        </div>
      </div>
    </div>
  )
}

export default page