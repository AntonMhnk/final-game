import { Physics } from "@react-three/rapier";
import Lights from "./Lights.jsx";
import { Level } from "./Level.jsx";
import { Player } from "./Player.jsx";
import useGame from "./stores/useGame.jsx";
import { viewport, isTMA } from "@telegram-apps/sdk";
import { useEffect } from "react";

export default function Experience() {
	const blocksCount = useGame((state) => state.blocksCount);
	const blocksSeed = useGame((state) => state.blocksSeed);

	useEffect(() => {
		async function initTg() {
			if (await isTMA()) {
				init();

				if (viewport.mount.isAvailable()) {
					await viewport.mount();
					viewport.expand();
				}

				if (viewport.requestFullscreen.isAvailable()) {
					await viewport.requestFullscreen();
				}
			}
		}
		initTg();
	}, []);

	return (
		<>
			<color args={["#bdedfc"]} attach="background" />

			<Physics debug={false}>
				<Lights />
				<Level count={blocksCount} seed={blocksSeed} />
				<Player />
			</Physics>
		</>
	);
}
