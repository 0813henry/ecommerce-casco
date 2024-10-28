import React from 'react'

const ProductDescription = ()  => {
  return (
    <div className='flex gap-3 mb-4'>
      <div>
        <button className='btn_dark_rounded !rounded-none !text-xs !py-[6px] w-36'>Description</button>
        <button className='btn_dark_outline !rounded-none !text-xs !py-[6px] w-36'>Care Guide</button>
        <button className='btn_dark_outline !rounded-none !text-xs !py-[6px] w-36'>Size guide</button>
      </div>
      <div className='flex flex-col pb-16'>
        <p className='text-sm'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum reprehenderit doloremque enim aspernatur ea ad facere officiis rerum, maxime perferendis, voluptatum natus sunt soluta. Nesciunt maxime necessitatibus, dolor commodi impedit eveniet ea quae, suscipit aut iusto fugiat natus dolore rerum tenetur totam ipsum doloremque, nobis blanditiis? Illum maiores temporibus dolore doloremque! Blanditiis impedit in tempore.</p>
        <p className='text-sm'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi consequuntur tenetur iure maxime et nihil nam nulla laudantium modi rerum autem praesentium, inventore nemo labore perspiciatis accusantium animi consequatur blanditiis.</p>
      </div>
    </div>
  )
}

export default ProductDescription
