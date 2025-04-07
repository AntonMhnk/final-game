import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import useGame from "./stores/useGame";

export function Player() {
	const [subscibeKeys, getKeys] = useKeyboardControls();
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

	useFrame((state, delta) => {
		/**
		 * Conrols
		 */
		const { forward, backward, leftward, rightward } = getKeys();

		const impulse = { x: 0, y: 0, z: 0 };
		const torque = { x: 0, y: 0, z: 0 };

		// Strenght impuslse and torque
		const impulseStrenght = 0.5 * delta;
		const torqueStrenght = 0.15 * delta;

		if (forward) {
			impulse.z -= impulseStrenght;
			torque.x -= torqueStrenght;
		}
		if (backward) {
			impulse.z += impulseStrenght;
			torque.x += torqueStrenght;
		}
		if (leftward) {
			impulse.x -= impulseStrenght;
			torque.z += torqueStrenght;
		}
		if (rightward) {
			impulse.x += impulseStrenght;
			torque.z -= torqueStrenght;
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
	 * Jump
	 */
	const jump = () => {
		const origin = body.current.translation();
		origin.y -= 0.31;
		const direction = { x: 0, y: -1, z: 0 };
		const ray = new rapier.Ray(origin, direction);
		const hit = rapierWorld.castRay(ray, 10, true);

		if (hit.timeOfImpact < 0.15) {
			body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
		}
	};

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

		const unsubsctibeJump = subscibeKeys(
			(state) => state.jump,
			(value) => {
				if (value) {
					jump();
				}
			}
		);

		// phases change
		const unsubscribeAny = subscibeKeys(() => {
			start();
		});

		return () => {
			unsubsctibeJump();
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
