import { Physics } from "@react-three/rapier";
import Lights from "./Lights.jsx";
import { Level } from "./Level.jsx";
import { Player } from "./Player.jsx";
import useGame from "./stores/useGame.jsx";
import { useEffect } from "react";

export default function Experience() {
	const blocksCount = useGame((state) => state.blocksCount);
	const blocksSeed = useGame((state) => state.blocksSeed);

	// FullScreen App
	useEffect(() => {
		// Initialize Telegram WebApp
		if (window.Telegram && window.Telegram.WebApp) {
			const webapp = window.Telegram.WebApp;
			
			// Expand to full height
			webapp.expand();
			
			// Enable closing confirmation
			webapp.enableClosingConfirmation();
			
			// Set viewport settings
			webapp.setViewportHeight();
			
			// Set background color
			webapp.setBackgroundColor('#bdedfc');
			
			// Ready event
			webapp.ready();
		}
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
