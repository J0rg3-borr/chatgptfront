import React from 'react'
import { FaRobot } from 'react-icons/fa'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-md py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="https://static.vecteezy.com/system/resources/previews/017/504/043/non_2x/bodybuilding-emblem-and-gym-logo-design-template-vector.jpg"
            alt="Gym Logo"
            className="h-24 w-24 object-contain border-4 border-gray-800 shadow-2xl p-1"
            style={{ borderRadius: '1rem', background: 'rgba(255,255,255,0.55)' }}
          />
          <FaRobot className="text-3xl text-white" />
          <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Titanes GYM
          </h1>
        </div>
        <div>
          <span className="text-sm md:text-base text-blue-100"></span>
        </div>
      </div>
    </header>
  )
}

export default Header
