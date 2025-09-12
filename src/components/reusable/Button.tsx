import React from 'react'

const Button = ({ text }: { text: string }) => {
  return (
    <div className="inline-flex p-[2px] rounded-full custom-gradient cursor-pointer">
      <div className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium whitespace-nowrap">
        {text}
      </div>
    </div>
  )
}

export default Button
