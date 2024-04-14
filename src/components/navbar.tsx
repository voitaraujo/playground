'use client';

import { usePathname } from 'next/navigation';

import { useEffect, useState } from 'react';

import { useTheme } from 'next-themes';
import { Link } from 'next-view-transitions';

import { cn } from '@/lib/utils';

function NavBar() {
	const pathname = usePathname();

	return (
		<div className='mb-12 flex h-[100px] w-full items-center justify-center'>
			<div className='flex-start  flex h-full w-full max-w-[1080px] items-center justify-start px-12'>
				<Link
					className={cn(
						'mr-auto font-mono underline-offset-2 hover:underline',
						pathname === '/'
							? 'pointer-events-none text-neutral-400 dark:text-zinc-600'
							: 'cursor-pointer'
					)}
					href='/'
				>
					root<span className={cn(pathname === '/' ? 'opacity-100' : 'opacity-0')}>.</span>
				</Link>

				<ThemeSwitch />
			</div>
		</div>
	);
}

function ThemeSwitch() {
	const [mounted, setMounted] = useState(false);

	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<select
			className='bg-transparent font-mono outline-none'
			value={theme || ''}
			onChange={(e) => setTheme(e.target.value)}
		>
			{mounted ? (
				<>
					<option value='system'>System</option>
					<option value='dark'>Dark</option>
					<option value='light'>Light</option>
				</>
			) : (
				<option value=''></option>
			)}
		</select>
	);
}

export { NavBar };
