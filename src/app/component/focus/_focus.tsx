'use client';

import {
	cloneElement,
	forwardRef,
	useEffect,
	useId,
	useRef,
	useState,
	type CSSProperties,
	type ForwardedRef,
	type ReactElement,
	type ReactNode,
} from 'react';

import Tippy, { type TippyProps } from '@tippyjs/react/headless';
import { motion, useSpring, type HTMLMotionProps, type SpringOptions } from 'framer-motion';
import { followCursor } from 'tippy.js/headless';

interface FocusProps {
	children: ReactElement; // since the children will be cloned & receive a ref, it has to be an ReactElement instead of ReactNode
	content: ReactNode;
	contentContainerProps?: HTMLMotionProps<'div'>;
}

// CONSTANTS
const springConfig = { damping: 50, stiffness: 500 } satisfies SpringOptions;
const initial_y = -10;
const initial_opacity = 0;
const initial_scale = 0.9;

function useForwardedRef<T>(ref: ForwardedRef<T>) {
	const innerRef = useRef<T>(null);

	useEffect(() => {
		if (!ref) return;
		if (typeof ref === 'function') {
			ref(innerRef.current);
		} else {
			ref.current = innerRef.current;
		}
	});

	return innerRef;
}

function useMediaQuery(query: string) {
	const [value, setValue] = useState(false);

	useEffect(() => {
		function onChange(event: MediaQueryListEvent) {
			setValue(event.matches);
		}

		const result = matchMedia(query);
		result.addEventListener('change', onChange);
		setValue(result.matches);

		return () => result.removeEventListener('change', onChange);
	}, [query]);

	return value;
}

const Focus = forwardRef<HTMLElement, FocusProps>(
	({ children, content, contentContainerProps }, ref) => {
		const targetRef = useForwardedRef(ref); // ref for the element that will trigger the tooltip
		const instanceId = useId(); // id that we'll use to track overlay & cloned elements
		const isDesktop = useMediaQuery('(min-width: 768px)');

		const opacity = useSpring(initial_opacity, springConfig);
		const scale = useSpring(initial_scale, springConfig);
		const y = useSpring(initial_y, springConfig);

		const onMount: TippyProps['onMount'] = ({}) => {
			createClonedElement(targetRef.current!, instanceId);
			createOverlayElement(instanceId);

			scale.set(1);
			opacity.set(1);
			y.set(0);
		};

		const onHide: TippyProps['onHide'] = ({ unmount }) => {
			// unmount the tooltip when it disappears
			opacity.on('change', (value) => {
				if (value <= initial_opacity) {
					unmount();
				}
			});

			destroyOverlayElement(instanceId);
			destroyClonedElement(targetRef.current!, instanceId);

			opacity.set(initial_opacity);
			scale.set(initial_scale);
			y.set(initial_y);
		};

		return (
			<>
				{cloneElement(children, {
					ref: targetRef,
					style: {
						display: 'inline-block',
						...(!isDesktop && {
							// disable selecting element
							userSelect: 'none',
							WebkitUserSelect: 'none',

							// disable dragging(for images)
							userDrag: 'none',
							WebkitUserDrag: 'none',

							// prevent context menu when long tap on mobile Safari
							WebkitTouchCallout: 'none',
						}),
					} satisfies CSSProperties,
				})}

				<Tippy
					render={(attrs) => {
						return (
							<motion.div
								style={{
									opacity,
									scale,
									y,
								}}
								{...contentContainerProps}
								{...attrs}
							>
								{content}
							</motion.div>
						);
					}}
					touch='hold'
					plugins={[followCursor]}
					animation={true}
					onMount={onMount}
					onHide={onHide}
					followCursor={isDesktop} // only enable following touch on desktop
					reference={targetRef}
					offset={[0, 32]}
				/>
			</>
		);
	}
);

Focus.displayName = 'Focus';

export { Focus };

type readonlyStyles = 'length' | 'parentRule';

function setupOverlayElement(el: HTMLDivElement) {
	const styles = {
		position: 'fixed',
		pointerEvents: 'none',
		left: '0',
		top: '0',
		zIndex: '998',
		height: '100vh',
		width: '100vw',
	} satisfies Partial<Omit<CSSStyleDeclaration, readonlyStyles>>;

	(Object.keys(styles) as (keyof Omit<CSSStyleDeclaration, readonlyStyles>)[]).forEach((prop) => {
		// @ts-expect-error
		el.style[prop] = styles[prop];
	});
}

function setupClonedElement(el: HTMLElement, target: HTMLElement) {
	const targetRect = target.getBoundingClientRect();

	/**
	 * If the size of the window changes(vertically or horizontally) dynamically,
	 * using position: absolute can cause visual bugs.
	 * But still, this is way more stable than using position:fixed and
	 * append listeners to update the position of the clone when scroll/resize.
	 */
	const styles = {
		pointerEvents: 'none',
		position: 'absolute',
		zIndex: '999',
		top: `${targetRect.y + window.scrollY}px`,
		left: `${targetRect.x + window.scrollX}px`,
		margin: '0',
	} satisfies Partial<Omit<CSSStyleDeclaration, readonlyStyles>>;

	(Object.keys(styles) as (keyof Omit<CSSStyleDeclaration, readonlyStyles>)[]).forEach((prop) => {
		// @ts-expect-error
		el.style[prop] = styles[prop];
	});

	/**
	 * remove the opacity from the target element so the blur filter don't make
	 * it slightly visible behind the cloned element.
	 */
	target.style.opacity = '0';
}

function createClonedElement(target: HTMLElement, instanceId: string) {
	const cloned = document.getElementById(`clone-${instanceId}`);

	if (cloned) {
		/**
		 * Checking if the cloned element exists && if it is about to be unmount,
		 * in that case we revert the unmount animation which will prevent it
		 * from doing so + we won't need to create the element from 0 again.
		 * (eg. if the user hover over the target element, moves the mouse
		 * somewhere else and them come back, really quickly.)
		 */
		//
		for (const animation of cloned.getAnimations()) {
			if (animation.playState === 'running') {
				animation.pause();
				animation.reverse();
			}
		}

		return;
	}

	const new_cloned = target.cloneNode(true) as HTMLElement;
	new_cloned.id = `clone-${instanceId}`;

	setupClonedElement(new_cloned, target);
	document.body.appendChild(new_cloned);

	new_cloned.animate([{ scale: 1 }, { scale: 1.05 }], {
		duration: 100,
		easing: 'linear',
		fill: 'forwards',
	});
}

function createOverlayElement(instanceId: string) {
	const overlay = document.getElementById(`overlay-${instanceId}`);

	if (overlay) {
		/**
		 * same explanation from createClonedElement() similar logic.
		 */
		for (const animation of overlay.getAnimations()) {
			if (animation.playState === 'running') {
				animation.pause();
				animation.reverse();
			}
		}

		return;
	}

	const new_overlay = document.createElement('div');
	new_overlay.id = `overlay-${instanceId}`;

	setupOverlayElement(new_overlay);
	document.body.appendChild(new_overlay);

	new_overlay.animate(
		{
			webkitBackdropFilter: ['blur(0px)', 'blur(2px)'],
			backdropFilter: ['blur(0px)', 'blur(2px)'],
		},
		{
			duration: 100,
			easing: 'linear',
			fill: 'forwards',
		}
	);
}

function destroyClonedElement(target: HTMLElement, instanceId: string) {
	const cloned = document.getElementById(`clone-${instanceId}`);

	if (!cloned || !target) return;

	cloned
		.animate([{ scale: 1.05 }, { scale: 1 }], {
			duration: 200,
			easing: 'linear',
			fill: 'forwards',
		})
		.addEventListener('finish', (ev) => {
			/**
			 * if the animation finishes with the currentTime 0, that means it was
			 * reversed(see initial explanation on createClonedElement()), and in
			 * that case we don't want to unmount the cloned component yet.
			 */
			if ((ev as AnimationPlaybackEvent).currentTime !== 0) {
				cloned.remove();
				/**
				 * restoring the opacity of the target element we changed
				 * on setupClonedElement()
				 */
				target.style.opacity = '1';
			}
		});
}

function destroyOverlayElement(instanceId: string) {
	const overlay = document.getElementById(`overlay-${instanceId}`);

	if (!overlay) return;

	overlay
		.animate(
			{
				webkitBackdropFilter: ['blur(2px)', 'blur(0px)'],
				backdropFilter: ['blur(2px)', 'blur(0px)'],
			},
			{
				duration: 200,
				easing: 'linear',
				fill: 'forwards',
			}
		)
		.addEventListener('finish', (ev) => {
			/**
			 * same explanation as destroyClonedElement() similar logic
			 */
			if ((ev as AnimationPlaybackEvent).currentTime !== 0) {
				overlay.remove();
			}
		});
}
