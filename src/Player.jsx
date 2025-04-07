import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import useGame from "./stores/useGame";

export function Player() {
	const [subscribeKeys, getKeys] = useKeyboardControls();
	const body = useRef();
	const { rapier, world } = useRapier();
	const rapierWorld = world;
	const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10));
	const [smoothCameraTarget] = useState(() => new THREE.Vector3());

	// Game phases
	const start = useGame((state) => state.start);
	const end = useGame((state) => state.end);
	const restart = useGame((state) => state.restart);
	const blocksCount = useGame((state) => state.blocksCount);

	/**
	 * Jump
	 */
	const jump = () => {
		const origin = body.current.translation();
		origin.y -= 0.31;
		const direction = { x: 0, y: -1, z: 0 };
		const ray = new rapier.Ray(origin, direction);
		const hit = rapierWorld.castRay(ray, 10, true);

		if (hit.timeOfImpact < 0.15) {
			body.current.applyImpulse({ x: 0, y: 0.1, z: 0 });
		}
	};

	useEffect(() => {
		const unsubscribeJump = subscribeKeys(
			(state) => state.jump,
			(value) => {
				if (value) jump();
			}
		);

		return () => {
			unsubscribeJump();
		};
	}, []);

	useFrame((state, delta) => {
		/**
		 * Controls
		 */
		const keyboardControls = getKeys();
		const mobileControls = window.mobileControls || {};

		// Combine keyboard and mobile controls
		const controls = {
			forward: keyboardControls.forward || mobileControls.forward,
			backward: keyboardControls.backward || mobileControls.backward,
			leftward: keyboardControls.leftward || mobileControls.leftward,
			rightward: keyboardControls.rightward || mobileControls.rightward,
			jump: keyboardControls.jump || mobileControls.jump,
		};

		if (controls.jump) {
			jump();
		}

		const impulse = { x: 0, y: 0, z: 0 };
		const torque = { x: 0, y: 0, z: 0 };

		const impulseStrength = 0.3 * delta;
		const torqueStrength = 0.1 * delta;

		if (controls.forward) {
			impulse.z -= impulseStrength;
			torque.x -= torqueStrength;
		}

		if (controls.backward) {
			impulse.z += impulseStrength;
			torque.x += torqueStrength;
		}

		if (controls.leftward) {
			impulse.x -= impulseStrength;
			torque.z += torqueStrength;
		}

		if (controls.rightward) {
			impulse.x += impulseStrength;
			torque.z -= torqueStrength;
		}

		body.current.applyImpulse(impulse);
		body.current.applyTorqueImpulse(torque);

		/**
		 * Camera animation
		 */
		const bodyPosition = body.current.translation();

		const cameraPosition = new THREE.Vector3();
		cameraPosition.copy(bodyPosition);
		cameraPosition.z += 3.5;
		cameraPosition.y += 1.65;

		const cameraTarget = new THREE.Vector3();
		cameraTarget.copy(bodyPosition);
		cameraTarget.y += 0.65;

		smoothCameraPosition.lerp(cameraPosition, 5 * delta);
		smoothCameraTarget.lerp(cameraTarget, 5 * delta);

		state.camera.position.copy(smoothCameraPosition);
		state.camera.lookAt(smoothCameraTarget);

		/**
		 * Phases
		 */
		if (bodyPosition.z < -(blocksCount * 4 + 2)) {
			end();
		}
		if (bodyPosition.y < -4) {
			restart();
		}
	});

	/**
	 * Reset
	 */
	const reset = () => {
		body.current.setTranslation({ x: 0, y: 1, z: 0 });
		body.current.setLinvel({ x: 0, y: 0, z: 0 });
		body.current.setAngvel({ x: 0, y: 0, z: 0 });
	};

	useEffect(() => {
		const unsubscribeReset = useGame.subscribe(
			(state) => state.phase,
			(value) => {
				if (value === "ready") {
					reset();
				}
			}
		);

		const unsubscribeJump = subscribeKeys(
			(state) => state.jump,
			(value) => {
				if (value) jump();
			}
		);

		// phases change
		const unsubscribeAny = subscribeKeys(() => {
			start();
		});

		return () => {
			unsubscribeJump();
			unsubscribeAny();
			unsubscribeReset();
		};
	}, []);

	return (
		<>
			{/* Ball */}
			<RigidBody
				ref={body}
				canSleep={false}
				colliders="ball"
				position={[0, 1, 0]}
				restitution={0.2}
				friction={1}
				linearDamping={0.5}
				angularDamping={0.5}
			>
				<mesh castShadow>
					<icosahedronGeometry args={[0.3, 1]} />
					<meshStandardMaterial flatShading color="mediumpurple" />
				</mesh>
			</RigidBody>
		</>
	);
}
