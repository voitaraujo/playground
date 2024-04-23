"use client"

import { cloneElement, forwardRef, useEffect, useId, useRef, type ForwardedRef, type ReactElement, type ReactNode } from 'react';

import Tippy, { type TippyProps } from '@tippyjs/react/headless';
import { motion, useSpring, type HTMLMotionProps, type SpringOptions } from 'framer-motion';
import { followCursor } from 'tippy.js/headless';

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

interface FocusProps {
	children: ReactElement; // since the children will be cloned & receive a ref, it has to be an ReactElement instead of ReactNode
	content: ReactNode;
	contentContainerProps?: HTMLMotionProps<'div'>;
}

// CONSTANTS
const springConfig = { damping: 50, stiffness: 500 } satisfies SpringOptions;
const initial_y = -10;
const initial_scale = 0.9;

const Focus = forwardRef<HTMLElement, FocusProps>(({ children, content: Content, contentContainerProps }, ref) => {
	const targetRef = useForwardedRef(ref); // ref for the element that will trigger the tooltip
	const instanceId = useId(); // id that we'll use to track overlay & cloned elements

	const opacity = useSpring(0, springConfig);
	const scale = useSpring(initial_scale, springConfig);
	const y = useSpring(initial_y, springConfig);

	function setupClonedElement(el: HTMLElement) {
		const target = targetRef.current;

		if (!target) return;

		const targetRect = target.getBoundingClientRect();

		/**
		 * If the size of the window changes(vertically or horizontally) dynamically,
		 * using position: absolute can cause visual bugs.
		 * But still, this is way more stable than using position:fixed and
		 * append listeners to update the position of the clone when scroll/resize.
		 */
		el.style.pointerEvents = 'none';
		el.style.position = 'absolute';
		el.style.zIndex = '999';
		el.style.top = `${targetRect.y + window.scrollY}px`;
		el.style.left = `${targetRect.x + window.scrollX}px`;
		el.style.margin = '0'; // you wanna do this, trust me.

		/**
		 * remove the opacity from the target element so the blur filter don't make
		 * it slightly visible behind the cloned element.
		 */
		target.style.opacity = '0';
	}

	function setupOverlayElement(el: HTMLDivElement) {
		el.style.position = 'fixed';
		el.style.pointerEvents = 'none';
		el.style.left = '0';
		el.style.top = '0';
		el.style.zIndex = '998';
		/**
		 * using svh because of weird mobile browsers viewport
		 * (I'm looking at you Safari!)
		 */
		el.style.height = '100svh';
		el.style.width = '100vw';
	}

	const createClonedElement = () => {
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

		const target = targetRef.current;

		if (!target) return;

		const new_cloned = target.cloneNode(true) as HTMLElement;
		new_cloned.id = `clone-${instanceId}`;

		setupClonedElement(new_cloned);
		document.body.appendChild(new_cloned);

		new_cloned.animate([{ scale: 1 }, { scale: 1.05 }], {
			duration: 100,
			easing: 'linear',
			fill: 'forwards',
		});
	};

	const destroyClonedElement = () => {
		const cloned = document.getElementById(`clone-${instanceId}`);
		const target = targetRef.current;

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
	};

	const createOverlayElement = () => {
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
				backdropFilter: ['blur(0px)', 'blur(2px)'],
			},
			{
				duration: 100,
				easing: 'linear',
				fill: 'forwards',
			}
		);
	};

	const destroyOverlayElement = () => {
		const overlay = document.getElementById(`overlay-${instanceId}`);

		if (!overlay) return;

		overlay
			.animate(
				{
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
	};

	const onMount: TippyProps['onMount'] = ({}) => {
		createOverlayElement();
		createClonedElement();

		scale.set(1);
		opacity.set(1);
		y.set(0);
	};

	const onHide: TippyProps['onHide'] = ({ unmount }) => {
		opacity.on('change', (value) => {
			if (value <= 0) {
				unmount();
			}
		});

		destroyOverlayElement();
		destroyClonedElement();

		opacity.set(0);
		scale.set(initial_scale);
		y.set(initial_y);
	};

	return (
		<>
			{cloneElement(children, {
				ref: targetRef,
				style: {
					display: 'inline-block',
				},
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
								{Content}
							</motion.div>
					);
				}}
				plugins={[followCursor]}
				animation={true}
				onMount={onMount}
				onHide={onHide}
				followCursor
				reference={targetRef}
				offset={[0, 32]}
			/>
		</>
	);
})

export { Focus };
