import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Link } from 'next-view-transitions';

function Page() {
	return (
		<main className='flex items-center justify-center'>
			<div className='flex w-full max-w-[1080px] flex-col px-12'>
				<h1 className='mb-8 text-xl font-bold text-zinc-800 dark:text-neutral-100'>
					Components at the playground 🛝
				</h1>

				<ul className='pl-12'>
					<li>
						<Link className='font-mono underline-offset-2 hover:underline' href='/component/focus'>
							• Focus
						</Link>
					</li>
				</ul>
				<span className='mt-24 w-fit border-t border-zinc-400 pt-4 text-zinc-500'>
					this playground was build for{' '}
					<a
						href='https://voit.dev'
						target='_blank'
						className='group inline-flex items-center text-nowrap  text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-300'
					>
						voit.dev
						<ArrowTopRightIcon className='opacity-0 group-hover:opacity-100' />
					</a>
				</span>
			</div>
		</main>
	);
}

export default Page;
