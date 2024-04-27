import { ReactNode } from 'react';

import Balancer from 'react-wrap-balancer';

interface ComponentInfoProps {
	title: string;
	description: string;
}

function Root({ children }: { children: ReactNode }) {
	return (
		<div className='flex max-w-[1080px] flex-1 flex-wrap items-start justify-between px-12'>
			{children}
		</div>
	);
}

function Title({ title }: { title: string }) {
	return <h1 className='w-full text-6xl font-bold text-zinc-800 dark:text-neutral-200'>{title}</h1>;
}

function Description({ description }: { description: string }) {
	return (
		<Balancer as='p' className='mt-4 text-lg font-medium text-zinc-500 dark:text-neutral-400'>
			{description}
		</Balancer>
	);
}

function PresentationContainer({ children }: { children: ReactNode }) {
	return (
		<div
			className={
				'flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-zinc-400/30 bg-neutral-50 py-16 px-4 shadow-xl dark:border-neutral-300/10 dark:bg-zinc-800'
			}
		>
			{children}
		</div>
	);
}

function Left({ children }: { children: ReactNode }) {
	return <div className='flex w-full max-w-[450px] flex-col'>{children}</div>;
}

function Right({ children }: { children: ReactNode }) {
	return <div className='flex w-full max-w-[450px] flex-col pb-[100px]'>{children}</div>;
}

const ComponentInfo = {
	Root: Root,
	Title: Title,
	Description: Description,
	PresentationContainer: PresentationContainer,
	Right: Right,
	Left: Left,
};

export default ComponentInfo;
