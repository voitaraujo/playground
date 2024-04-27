import Image from 'next/image';

import { ArrowTopRightIcon, GitHubLogoIcon } from '@radix-ui/react-icons';

import ComponentInfo from '@/components/component-info';

import { Focus } from './_focus';

async function Page() {
	return (
		<main className='flex items-center justify-center'>
			<ComponentInfo.Root>
				<ComponentInfo.Left>
					<ComponentInfo.Title title='Focus wrapper' />
					<ComponentInfo.Description description='Wrap React elements with this component to draw the user attention to whatever you place inside the tooltip.' />

					<div className='mb-4 mt-12 flex items-center gap-8'>
						<a
							className='group inline-flex w-fit items-center font-mono underline-offset-2 hover:underline'
							target='_blank'
							href='https://voit.dev/thoughts/ios-like-effect'
						>
							<Image
								className='mr-2'
								src='https://voit.dev/favicon.svg'
								width={16}
								height={16}
								alt='voit.dev logo'
							/>
							read more
							<ArrowTopRightIcon className='opacity-0 group-hover:opacity-100' />
						</a>
						<a
							className='group inline-flex w-fit items-center font-mono underline-offset-2 hover:underline'
							target='_blank'
							rel='noreferrer'
							href='https://gist.github.com/voitaraujo/91eda300afd35aeb6ab419e55e7447aa'
						>
							<GitHubLogoIcon className='mr-2' />
							code
							<ArrowTopRightIcon className='opacity-0 group-hover:opacity-100' />
						</a>
					</div>
				</ComponentInfo.Left>
				<ComponentInfo.Right>
					<ComponentInfo.PresentationContainer>
						<p className='text-center'>
							try to hover(or press){' '}
							<Focus
								content={
									<p>
										<span className='font-semibold underline underline-offset-2'>Cool right?</span>{' '}
										Everything besides our target element and tooltip gets blurred!
										<br />
										<br />
										<span>• you could also apply other filters instead of blur</span>
									</p>
								}
								contentContainerProps={{
									className:
										'border-zinc-400/30 bg-zinc-800  text-zinc-300 dark:bg-white dark:text-black max-w-[350px] rounded-md border p-4 text-sm font-light shadow-md',
								}}
							>
								<span className='w-fit cursor-default rounded-md border border-zinc-400/20 bg-zinc-800 px-2 text-base font-medium leading-6 text-white dark:bg-white dark:text-black'>
									this
								</span>
							</Focus>{' '}
							word, or the following image:
						</p>

						<Focus
							content={'BzzzZT!'}
							contentContainerProps={{
								className:
									'border-zinc-400/30 bg-zinc-800  text-zinc-300 dark:bg-white dark:text-black max-w-[300px] rounded-md border p-4 text-sm font-light shadow-md',
							}}
						>
							<Image
								className='mt-12 rounded-full'
								src='/ph.png'
								width={100}
								height={100}
								quality={100}
								alt='Picture of the author'
							/>
						</Focus>
					</ComponentInfo.PresentationContainer>
				</ComponentInfo.Right>
			</ComponentInfo.Root>
		</main>
	);
}

export default Page;
