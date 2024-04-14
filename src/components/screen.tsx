'use client';

// code by @Sh4yy on https://gist.github.com/Sh4yy/0300299ae60af4910bcb341703946330
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

function ScreenSize() {
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		function updateDimensions() {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		updateDimensions();
		window.addEventListener('resize', updateDimensions);

		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, []);

	const { width, height } = dimensions;

	return (
		<motion.div
			style={{
				left: dimensions.width > 1080 ? `calc(${(dimensions.width - 1080) / 2}px + 3rem)` : '3rem',
			}}
			className='fixed bottom-5 z-50 flex items-center space-x-2 rounded-full bg-black px-2.5 py-1 font-mono text-xs font-medium text-white dark:bg-white dark:text-black'
		>
			<span>
				{width.toLocaleString()} x {height.toLocaleString()}
			</span>
			<div className='h-4 w-px bg-gray-800' />
			<span className='sm:hidden'>XS</span>
			<span className='hidden sm:max-md:inline'>SM</span>
			<span className='hidden md:max-lg:inline'>MD</span>
			<span className='hidden lg:max-xl:inline'>LG</span>
			<span className='hidden xl:max-2xl:inline'>XL</span>
			<span className='max-2xl:hidden'>2XL</span>
		</motion.div>
	);
}

export { ScreenSize };
