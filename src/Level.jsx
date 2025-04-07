import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float, Text } from "@react-three/drei";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const floor1Material = new THREE.MeshStandardMaterial({ color: "limegreen" });
const floor2Material = new THREE.MeshStandardMaterial({ color: "greenyellow" });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new THREE.MeshStandardMaterial({ color: "slategrey" });

export function BlockStart({ position = [0, 0, 0] }) {
	return (
		<group position={position}>
			<Float floatIntensity={0.25} rotationIntensity={0.25}>
				<Text
					scale={0.5}
					font="/bebas-neue-v9-latin-regular.woff"
					maxWidth={0.25}
					lineHeight={0.75}
					textAlign="right"
					position={[0.75, 0.65, 0]}
					rotation-y={-0.25}
				>
					Marble Race
					<meshBasicMaterial toneMapped={false} />
				</Text>
			</Float>
			{/* Floor */}
			<mesh
				geometry={boxGeometry}
				material={floor1Material}
				position={[0, -0.1, 0]}
				scale={[4, 0.2, 4]}
				receiveShadow
			/>
		</group>
	);
}

export function BlockEnd({ position = [0, 0, 0] }) {
	const hamburger = useGLTF("/hamburger.glb");
	hamburger.scene.children.forEach((mesh) => {
		mesh.castShadow = true; // enable shadows
	});

	return (
		<group position={position}>
			<Text
				font="/bebas-neue-v9-latin-regular.woff"
				scale={1}
				position={[0, 2.25, 2]}
			>
				FINISH
				<meshBasicMaterial toneMapped={false} />
			</Text>
			{/* Floor */}
			<mesh
				geometry={boxGeometry}
				material={floor1Material}
				position={[0, 0, 0]}
				scale={[4, 0.2, 4]}
				receiveShadow
			/>
			{/* Hamburger */}
			<RigidBody
				type="fixed"
				colliders="hull"
				position={[0, 0.25, 0]}
				restitution={0.2}
				friction={0}
			>
				<primitive object={hamburger.scene} scale={0.2} />
			</RigidBody>
		</group>
	);
}

export function BlockSpinner({ position = [0, 0, 0] }) {
	const obstacle = useRef();

	// speed and rotation orientation
	const [speed] = useState(
		() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1)
	);

	useFrame((state) => {
		const time = state.clock.getElapsedTime();

		const rotation = new THREE.Quaternion();
		rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
		obstacle.current.setNextKinematicRotation(rotation);
	});

	return (
		<group position={position}>
			{/* Floor */}
			<mesh
				geometry={boxGeometry}
				material={floor2Material}
				position={[0, -0.1, 0]}
				scale={[4, 0.2, 4]}
				receiveShadow
			/>
			{/* Obstacle */}
			<RigidBody
				ref={obstacle}
				type="kinematicPosition"
				position={[0, 0.3, 0]}
				restitution={0.2}
				friction={0}
			>
				<mesh
					geometry={boxGeometry}
					material={obstacleMaterial}
					scale={[3.5, 0.3, 0.3]}
					castShadow
					receiveShadow
				/>
			</RigidBody>
		</group>
	);
}

export function BlockLimbo({ position = [0, 0, 0] }) {
	const obstacle = useRef();

	// time offset
	const [timeOffset] = useState(() => Math.random() * Math.PI * 2);

	useFrame((state) => {
		const time = state.clock.getElapsedTime();

		// up and down movement
		const y = Math.sin(time * timeOffset) + 1.2;
		obstacle.current.setNextKinematicTranslation({
			x: position[0],
			y: position[1] + y,
			z: position[2],
		});
	});

	return (
		<group position={position}>
			{/* Floor */}
			<mesh
				geometry={boxGeometry}
				material={floor2Material}
				position={[0, -0.1, 0]}
				scale={[4, 0.2, 4]}
				receiveShadow
			/>
			{/* Obstacle */}
			<RigidBody
				ref={obstacle}
				type="kinematicPosition"
				position={[0, 0.3, 0]}
				restitution={0.2}
				friction={0}
			>
				<mesh
					geometry={boxGeometry}
					material={obstacleMaterial}
					scale={[3.5, 0.3, 0.3]}
					castShadow
					receiveShadow
				/>
			</RigidBody>
		</group>
	);
}

export function BlockAxe({ position = [0, 0, 0] }) {
	const obstacle = useRef();

	// time offset
	const [timeOffset] = useState(() => Math.random() * Math.PI * 2);

	useFrame((state) => {
		const time = state.clock.getElapsedTime();

		// left and right movement
		const x = Math.sin(time * timeOffset) * 1.25;
		obstacle.current.setNextKinematicTranslation({
			x: position[0] + x,
			y: position[1] + 0.8,
			z: position[2],
		});
	});

	return (
		<group position={position}>
			{/* Floor */}
			<mesh
				geometry={boxGeometry}
				material={floor2Material}
				position={[0, -0.1, 0]}
				scale={[4, 0.2, 4]}
				receiveShadow
			/>
			{/* Obstacle */}
			<RigidBody
				ref={obstacle}
				type="kinematicPosition"
				position={[0, 0.3, 0]}
				restitution={0.2}
				friction={0}
			>
				<mesh
					geometry={boxGeometry}
					material={obstacleMaterial}
					scale={[1.5, 1.5, 0.3]}
					castShadow
					receiveShadow
				/>
			</RigidBody>
		</group>
	);
}

export function Bounds({ length = 1 }) {
	return (
		<>
			<RigidBody type="fixed" restitution={0.2} friction={0}>
				<CuboidCollider
					args={[2, 0.1, 2 * length]}
					position={[0, -0.1, -(length * 2) + 2]}
					restitution={0.2}
					friction={1}
				/>
				{/* right wall */}
				<mesh
					position={[2.15, 0.75, -(length * 2) + 2]}
					geometry={boxGeometry}
					material={wallMaterial}
					scale={[0.3, 1.5, 4 * length]}
					castShadow
				/>
				{/* left wall */}
				<mesh
					position={[-2.15, 0.75, -(length * 2) + 2]}
					geometry={boxGeometry}
					material={wallMaterial}
					scale={[0.3, 1.5, 4 * length]}
					receiveShadow
				/>
				{/* back wall */}
				<mesh
					position={[0, 0.75, -(length * 4) + 2]}
					geometry={boxGeometry}
					material={wallMaterial}
					scale={[4, 1.5, 0.3]}
					receiveShadow
				/>
			</RigidBody>
		</>
	);
}

export function Level({
	count = 5,
	types = [BlockSpinner, BlockAxe, BlockLimbo],
	seed = 0,
}) {
	const blocks = useMemo(() => {
		const blocks = [];

		for (let i = 0; i < count; i++) {
			const type = types[Math.floor(Math.random() * types.length)];
			blocks.push(type);
		}

		return blocks;
	}, [count, types, seed]);

	return (
		<>
			<BlockStart position={[0, 0, 0]} />

			{blocks.map((Block, index) => (
				<Block key={index} position={[0, 0, -(index + 1) * 4]} />
			))}

			<BlockEnd position={[0, 0, -(count + 1) * 4]} />

			<Bounds length={count + 2} />
		</>
	);
}
