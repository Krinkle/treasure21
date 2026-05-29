//
// Hey you! I said "view behind the curtain",
// not "break and enter through the backdoor".
//
// Anyway, it's okay. I suppose I deserve that, for the "strong-smelling smoked fish".
//
// Note that you're not expected to be able to crack the encryption below.
// Have a look if you like! But, I promise this file won't help with the puzzle.
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
	const ACTION_UP = 'ACTION_UP';
	const ACTION_DOWN = 'ACTION_DOWN';
	const ACTION_LEFT = 'ACTION_LEFT';
	const ACTION_RIGHT = 'ACTION_RIGHT';
	const ACTION_COLOR = 'ACTION_COLOR';
	const ACTION_SIZE = 'ACTION_SIZE';
	const htmlToAction = {
		'play-kb-up': ACTION_UP,
		'play-kb-down': ACTION_DOWN,
		'play-kb-left': ACTION_LEFT,
		'play-kb-right': ACTION_RIGHT,
		'play-kb-a': ACTION_COLOR,
		'play-kb-b': ACTION_SIZE
	};
	const actionToHtml = Object.fromEntries(Object.entries(htmlToAction).map(([k, v]) => [v, k]));

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
	let encryptedSecret = '2c30947f76d0786f51fc995dLQA6B9eBey3Vzq1wU98cQ4i2i8PSkTdEilZqfW/NSWv3zngXLBDYRCp4sO1Jv0ZXLwb2nWpWGYKxhwBaJWUzQn0OH0CJd47MAJQZqgqvR1QKBnQxiYoNHt41cWg/jOXYfg==';

	function at(pos) {
		// Support Safari 17-18: Workaround https://bugs.webkit.org/show_bug.cgi?id=285705
		if (pos.row >= 0 && pos.row < grid.children.length &&
			pos.col >= 0 && pos.col < grid.children[pos.row].children.length
		) {
			return grid.children[pos.row] && grid.children[pos.row].children[pos.col];
		}
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

	function animate(action) {
		const el = document.getElementById(actionToHtml[action]);
		if (el) {
			el.animate(
				[
					{ filter: 'brightness(2)' },
					{ filter: 'brightness(1)' }
				],
				{ duration: 200 }
			);
		}
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
		animate(action);
	}

	// Use keydown instead of keyup, to allow fun with long press!
	document.addEventListener('keydown', e => {
		switch (e.code) {
			case 'ArrowUp':
				input(ACTION_UP);
				break;
			case 'ArrowDown':
				input(ACTION_DOWN);
				break;
			case 'ArrowLeft':
				input(ACTION_LEFT);
				break;
			case 'ArrowRight':
				input(ACTION_RIGHT);
				break;
			case 'KeyA':
			case 'Numpad1':
			case 'Digit1':
				input(ACTION_COLOR);
				break;
			case 'KeyB':
			case 'Numpad2':
			case 'Digit2':
				input(ACTION_SIZE);
				break;
			default:
				return;
		}

		e.preventDefault();
	});

	for (const id in htmlToAction) {
		const action = htmlToAction[id];
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
	}
	document.querySelector('#play-keyboard').hidden = false;

	// init
	at(pos).classList.add('cell--cursor');

	const helperText = `📢 Hello. For these puzzles, it'll be easier if you use "view source" instead of "inspect element". Enjoy!`;
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
