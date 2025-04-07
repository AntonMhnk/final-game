import { useEffect, useRef, useState } from "react";
import useGame from "./stores/useGame";
import { useKeyboardControls } from "@react-three/drei";

export default function MobileControls() {
	const joystickRef = useRef();
	const knobRef = useRef();
	const touchStartRef = useRef(null);
	const start = useGame((state) => state.start);

	// Fix: Use the correct way to get setControls from useKeyboardControls
	const setControls = useKeyboardControls((state) => state.forward);

	const [mobileState, setMobileState] = useState({
		forward: false,
		backward: false,
		leftward: false,
		rightward: false,
		jump: false,
	});

	useEffect(() => {
		window.mobileControls = mobileState;
	}, [mobileState]);

	useEffect(() => {
		// Make sure mobile controls are visible
		const mobileControls = document.querySelector(".mobile-controls");
		if (mobileControls) {
			mobileControls.style.display = "block";
			mobileControls.style.pointerEvents = "auto";
		}

		// Enable the jump button
		const jumpButton = document.querySelector(".jump-button");
		if (jumpButton) {
			jumpButton.style.pointerEvents = "auto";
		}
	}, []);

	const handleJoystickStart = (e) => {
		e.preventDefault();
		const touch = e.touches[0];
		const joystick = joystickRef.current.getBoundingClientRect();
		const centerX = joystick.left + joystick.width / 2;
		const centerY = joystick.top + joystick.height / 2;

		touchStartRef.current = { centerX, centerY };
		start();
		updateJoystickPosition(touch.clientX, touch.clientY);
	};

	const handleJoystickMove = (e) => {
		e.preventDefault();
		if (!touchStartRef.current) return;
		const touch = e.touches[0];
		updateJoystickPosition(touch.clientX, touch.clientY);
	};

	const updateJoystickPosition = (touchX, touchY) => {
		if (!touchStartRef.current) return;

		const { centerX, centerY } = touchStartRef.current;
		const deltaX = touchX - centerX;
		const deltaY = touchY - centerY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const angle = Math.atan2(deltaY, deltaX);
		const maxRadius = 35;
		const limitedDistance = Math.min(distance, maxRadius);
		const limitedX = Math.cos(angle) * limitedDistance;
		const limitedY = Math.sin(angle) * limitedDistance;

		if (knobRef.current) {
			knobRef.current.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
		}

		const normalizedX = limitedX / maxRadius;
		const normalizedY = limitedY / maxRadius;
		const threshold = 0.3;

		const newState = {
			forward: normalizedY < -threshold,
			backward: normalizedY > threshold,
			leftward: normalizedX < -threshold,
			rightward: normalizedX > threshold,
			jump: mobileState.jump,
		};

		setMobileState(newState);
		window.mobileControls = newState;
	};

	const handleJoystickEnd = () => {
		touchStartRef.current = null;
		if (knobRef.current) {
			knobRef.current.style.transform = `translate(0px, 0px)`;
		}

		const newState = {
			...mobileState,
			forward: false,
			backward: false,
			leftward: false,
			rightward: false,
		};

		setMobileState(newState);
		window.mobileControls = newState;
	};

	const handleJumpStart = (e) => {
		e.preventDefault();
		e.stopPropagation();
		start();

		const newState = {
			...mobileState,
			jump: true,
		};

		setMobileState(newState);
		window.mobileControls = newState;
	};

	const handleJumpEnd = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const newState = {
			...mobileState,
			jump: false,
		};

		setMobileState(newState);
		window.mobileControls = newState;
	};

	return (
		<div className="mobile-controls">
			<div
				ref={joystickRef}
				className="joystick"
				onTouchStart={handleJoystickStart}
				onTouchMove={handleJoystickMove}
				onTouchEnd={handleJoystickEnd}
				onTouchCancel={handleJoystickEnd}
			>
				<div className="knob" ref={knobRef}></div>
			</div>
			<button
				className="jump-button"
				onTouchStart={handleJumpStart}
				onTouchEnd={handleJumpEnd}
				onTouchCancel={handleJumpEnd}
			>
				Jump
			</button>
		</div>
	);
}
