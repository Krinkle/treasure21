//
// Hey you! I said "view behind the curtain",
// not "go wander out back in the parking lot".
//
// Anyway, it's okay.
// I suppose I deserve that, for the "strong-smelling smoked fish".
//
// Note that you're not meant to be able to crack the below encryption.
// Have a look around if you like! Though, I promise it won't help with the challenge.
//
// (Remember that you may look things up, for example on Wikipedia.)
//
// -- Krinkle, 2021
//


/*! Copyright 2021 Timo Tijhof <https://timotijhof.net> | MIT License */
function main() {
	let grid = document.querySelector('#board');
	let color = 1;
	let size = 1;
	let pos = { row: 1, col: 1 };
	const ACTION_UP = 'ArrowUp';
	const ACTION_DOWN = 'ArrowDown';
	const ACTION_LEFT = 'ArrowLeft';
	const ACTION_RIGHT = 'ArrowRight';
	const ACTION_COLOR = 'Space';
	const ACTION_SIZE = 'Control';

	let baseDoctitle = document.title.replace(/./g, '-');
	let sizeEmojis = {
		'1': '⬛️',
		'2': '◼️',
		'3': '▪️',
		'4': '▪️'
	};
	let emojiPos = 1;
	let colorEmojis = {
		'1': '🟧',
		'2': '🟦',
		'3': '🟥',
		'4': '🟪',
		'5': '🟨',
		'6': '⬜️'
	};

	let memory = [];
	let encryptedSecret = 'adcab87588026df587055fdb45HbIxhOOyLuxMT3AzHq9sohec5aqI1uSa27fX6AUkTsEQF9JI0WwCXp80Vq4c05kbgjs69nJoyabjBEyU4Gge5ktbVd/jqPKcqGkM3yICCH1k5Q0Vrdmhnpf0PNRfnhQg==';

	function at(pos) {
		return grid.children[pos.row] && grid.children[pos.row].children[pos.col];
	}

	function updateDoctitle(diff) {
		let title = baseDoctitle;
		let emoji = colorEmojis[color];
		// move forward or backward
		emojiPos += diff;
		// wrap around if needed
		if (diff < 0 && emojiPos < 0) {
			emojiPos = baseDoctitle.length;
		} else if (diff > 0 && emojiPos > baseDoctitle.length) {
			emojiPos = 0;
		}
		title = title.slice(0, emojiPos) + emoji + title.slice(emojiPos);
		title = title.replace(/-/g, sizeEmojis[size]);
		document.title = title;
	}

	function setPos(newPos) {
		at(pos).classList.remove('cell--cursor');
		at(newPos).classList.add('cell--cursor');
		pos = newPos;
	}

	function fnv132(str) {
		let hash = 0x811C9DC5;
		for (let i = 0; i < str.length; i++) {
			hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
			hash ^= str.charCodeAt(i);
		}
		hash = (hash >>> 0).toString(36).slice(0, 5);
		while (hash.length < 5) {
			hash = '0' + hash;
		}
		return hash;
	}

	async function attempt() {
		let passwordCandidate = fnv132(memory.join(''));

		// let newSecret = '';
		// console.log(await aesGcmEncrypt(newSecret, passwordCandidate));

		let secret;
		try {
			secret = await aesGcmDecrypt(encryptedSecret, passwordCandidate);
		} catch (e) {
			return;
		}
		let nextNode = document.querySelector('#next');
		let pNode = nextNode.lastElementChild;
		pNode.textContent = secret;
		nextNode.hidden = false;
	}

	function input(action) {
		let newPos = { row: pos.row, col: pos.col };
		switch (action) {
			case ACTION_UP:
				newPos.row -= 1;
				if (!at(newPos)) {
					// "In the universe there is room for an infinite series of beginnings."
					// - Celia Green
					newPos.row = 3;
				}
				setPos(newPos);
				updateDoctitle(-1);
				break;
			case ACTION_DOWN:
				newPos.row += 1;
				if (!at(newPos)) {
					newPos.row = 0;
				}
				setPos(newPos);
				updateDoctitle(1);
				break;
			case ACTION_LEFT:
				newPos.col -= 1;
				if (!at(newPos)) {
					newPos.col = 3;
				}
				setPos(newPos);
				updateDoctitle(-1);
				break;
			case ACTION_RIGHT:
				newPos.col += 1;
				if (!at(newPos)) {
					newPos.col = 0;
				}
				setPos(newPos);
				updateDoctitle(1);
				break;
			case ACTION_COLOR:
				color++;
				if (color > 6) {
					color = 1;
				}
				grid.dataset.color = String(color);
				updateDoctitle(0);
				break;
			case ACTION_SIZE:
				size++;
				if (size > 4) {
					size = 1;
				}
				grid.dataset.size = String(size);
				updateDoctitle(0);
				break;
			default:
				throw new Error('Unknown action: ' + action);
		}

		memory.push(action);
		memory = memory.slice(-10);
		setTimeout(attempt);
	}

	// Use keydown instead of keyup, to allow fun with long press!
	document.addEventListener('keydown', e => {
		switch (e.code) {
			case 'KeyW':
			case 'ArrowUp':
				input(ACTION_UP);
				break;
			case 'KeyS':
			case 'ArrowDown':
				input(ACTION_DOWN);
				break;
			case 'KeyA':
			case 'ArrowLeft':
				input(ACTION_LEFT);
				break;
			case 'KeyD':
			case 'ArrowRight':
				input(ACTION_RIGHT);
				break;
			case 'Space':
				input(ACTION_COLOR);
				break;
			case 'Alt':
			case 'AltLeft':
			case 'AltRight':
			case 'Control':
			case 'ControlLeft':
			case 'ControlRight':
				input(ACTION_SIZE);
				break;
			default:
				return;
		}

		e.preventDefault();
	});

	[
		[ 'play-kb-up', ACTION_UP ],
		[ 'play-kb-down', ACTION_DOWN ],
		[ 'play-kb-left', ACTION_LEFT ],
		[ 'play-kb-right', ACTION_RIGHT ],
		[ 'play-kb-a', ACTION_COLOR ],
		[ 'play-kb-b', ACTION_SIZE ]
	].forEach( ( [ id, action ] ) => {
		const el = document.getElementById(id);
		if (el) {
			el.addEventListener('click', e => {
				input(action);
			});
			el.addEventListener('touchstart', e => {
				input(action);
				// Prefer touch, since it'll dispatch 0.3s faster on mobile.
				// But prevent default of turning into click, 0.3s later.
				e.preventDefault();
			});
		}
	} );

	if ('ontouchstart' in document) {
		document.querySelector('#play-keyboard').hidden = false;
	}

	// init
	at(pos).classList.add('cell--cursor');

	const helperText = `📢 Hello. For these challenges, it'll be easier if you use "view source" instead of "inspect element". Enjoy!`;
	console.log(helperText);
	document.body.prepend(document.createComment(helperText));
}

main();

/*! (c) Chris Veness | MIT Licence | https://gist.github.com/Krinkle/58dd2281c033e3626ce2e7f20e85aaf4 */
// eslint-disable-next-line no-unused-vars
async function aesGcmEncrypt(plaintext, password) {
    const pwUtf8 = new TextEncoder().encode(password);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv: iv };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    const ptUint8 = new TextEncoder().encode(plaintext);
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
    const ctArray = Array.from(new Uint8Array(ctBuffer));
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
    const ctBase64 = btoa(ctStr);
    const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return ivHex + ctBase64;
}

async function aesGcmDecrypt(ciphertext, password) {
    const pwUtf8 = new TextEncoder().encode(password);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = ciphertext.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16));
    const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
    const ctStr = atob(ciphertext.slice(24));
    const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
    const plaintext = new TextDecoder().decode(plainBuffer);
    return plaintext;
}
