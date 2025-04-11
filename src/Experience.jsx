import { Physics } from "@react-three/rapier";
import Lights from "./Lights.jsx";
import { Level } from "./Level.jsx";
import { Player } from "./Player.jsx";
import useGame from "./stores/useGame.jsx";
import { useEffect } from "react";

export default function Experience() {
	const blocksCount = useGame((state) => state.blocksCount);
	const blocksSeed = useGame((state) => state.blocksSeed);

	useEffect(() => {
		// Initialize Telegram WebApp safely
		if (window.Telegram?.WebApp) {
			const webapp = window.Telegram.WebApp;

			// Only call methods that are available in version 6.0
			if (webapp.expand) {
				webapp.expand();
			}

			if (webapp.ready) {
				webapp.ready();
			}
		}

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

		// Handle viewport height for mobile
		const updateHeight = () => {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty("--vh", `${vh}px`);
		};

		updateHeight();
		window.addEventListener("resize", updateHeight);
		window.addEventListener("orientationchange", updateHeight);

		// Cleanup
		return () => {
			window.removeEventListener("resize", updateHeight);
			window.removeEventListener("orientationchange", updateHeight);
		};
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
