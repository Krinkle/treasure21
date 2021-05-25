/*! Copyright 2021 Timo Tijhof <https://timotijhof.net> | MIT License */
function main() {
	const altar = document.getElementById('credits-altar');

	const audioFarewell = document.getElementById('credits-farewell');
	const divMusic = document.getElementById('credits-music');
	const volumeInput = document.getElementById('credits-kb-audio');
	const volumeWrap = document.getElementById('credits-kb-audio-wrap');

	function play() {
		audioFarewell.play();
		altar.title = 'Pause music';
		if (audioFarewell.volume != 0.0) {
			volumeWrap.classList.remove('credits-kb-audio-wrap--muted');
		}
	}

	function pause() {
		audioFarewell.pause();
		altar.title = 'Play music';
		volumeWrap.classList.add('credits-kb-audio-wrap--muted');
	}

	altar.style.cursor = 'pointer';
	altar.addEventListener('click', e => {
		if (audioFarewell.paused) {
			play();
		} else {
			pause();
		}
	});

	audioFarewell.volume = volumeInput.value;
	volumeInput.addEventListener('input', e => {
		audioFarewell.volume = volumeInput.value;
		if (audioFarewell.volume == 0.0) {
			pause();
			volumeWrap.classList.add('credits-kb-audio-wrap--muted');
		} else {
			play();
			volumeWrap.classList.remove('credits-kb-audio-wrap--muted');
		}
	});
	divMusic.hidden = false;

	function onDocClick(e) {
		if (e.ctrlKey || e.metaKey || e.altKey) {
			return;
		}
		document.removeEventListener('click', onDocClick);
		play();
	}
	document.addEventListener('click', onDocClick);

	// Set initial `altar.title` and muted icon.
	pause();
}

main();
