/*! Copyright 2021 Timo Tijhof <https://timotijhof.net> | MIT License */
async function main() {
	let encryptedClues = {
		first: 'bc519781e9f6edf7cbc6f04d3SmA4IU0rjCZZc0hCWqIwxluBoaE4My9MeqI6I2RiFAEAK/r0nlSbr7lY9f7IFZQxcpdCDz7vjIAKjRvdd9tngA7m1mkIsFYSkt0foO8vW7rUE940QfG2hXz0Sp5mAGzv48ArPU=',
		dir: '5af69312066b0666882bcca83U+xdtFgBRz5MbUVdN6gxd4oO80YyxeN4ozbA0ULYkGoovpUTLjaXssOnjpRZBI=',
		app: 'a4db84a92cc7c0e5e58e3e87FCeBJfPMDGQmTvVzTx6EBtekMV7aYr9aw8vFN2PO5dd8Id6SvNrOGytF+YnBjnV/7M2jUX/pLyHV6vHOaJeqnHcFy7sJDxWU0cuqunCO1M6AyPykitOyvZRwXQdBZJnh',
		inspect: 'eead5a51beb50aa23016cff7J4YwjyHRvcs3C6l49cbAglymoQ2QqXL/zqmH5fjcxs4E4Lr1E0wJ5JCt9gexyo2HnM2Seip4nVZyWVy9CkZHa4hWXhE0PPy7WpEmRBJ97H+4rDMpHg4zTNdyYBb61uvM0Ui1H5XAnJMVHX4txUTydtxYx5qdX+e0SRkCgEc9G/KiVcYWXgFTlYK/qVM0T96/O/QsNRje7HoE60i6aAEQ4cx1JeA25wWaxBATw6MUG3IQNunLjWCf5qGfqrdRhiA8OUWhO8+7TTkiGRF/Ga+Tpf+l+eaOzj91qfYOZcUpPoMOyEzzWcLslqiQFElYWQo5l8q14xIxl7jLqJqTSMCq2aZdsID4PolY8Sy9n3sFV/qrcC/TJ+GTu0h2XqMI3BH6Ek5sq69KQPmlg01YGl4Tm8f4PDmvtrUDY5R1XfvrgEpjlB8uXtzKlkwaX/eczNg9keKiRoxIkVk6ibI1sNT20js282ZdemFlhmCmnP2Cjq0RCno021FsrH5hvQ6rJt2cyZskXpWoTbg/5KcHDLFcz/e1HaR82e1NiEyWTWUwtw6h98Rm8jJMCXeyt2pnQ4P7gXY0GuHR2MUfbzDlWHd9wagcqb8nEKFkpiSU4E4PfjX2BBr48A2KF+r1MO0EvwHiDD5ucKG6XnqvQZKjdaKUwYGnZSHMZ3PXO6Zq1SXoYKjeWhku3bwADIyjybST6MuyoMOCP8qqga3d8hwb0itd9EH1/2629DT9Bj6fJiS9XlUScUjMKE3cvFnBwwka1DjnBvouJZ4htBn4PPaUydNbjMTfPd/YZ1LVw+AIxfdYL72Gqqa+z9fiqfCmGssT0VSI00xT6cxwqRTt7tM683Y9D4cYGo5qrLdE7MZqM0xwCGHdmhs0uUQV22iPDDMryUAKJTZ9i9ULoVkTos/KAcHyOoPCAHvFJXb2ZLoLysNISZJmYgeH/CxZnzWnfq0JoJZ8h42MwOzNZGQ1d2oslUHfUT7V04+xQXh0jEO44RzdIiLTiiyrT31eiVHLzAB6vaD4VHhzmFRljdZnp/ZDhh3ehI6KTXaBL5OYZCVavAg6+CnJ3NZJcNiLWtt/kumy+Oe/rA5WSV2/lntxZ7y908B6qF3Vq347p2Qcyu0kjsCxRRMXcc9dKPo0NROif8KGZNcpbJqz3BI6XosYnvdiOJCAK2W6krR9dD9jeh0zMy+xcBiVfyNa9UtZMH6AtQmamkj8u2Z3jYA2u/GTLPK3g4X4ULRj6RRdTOw1T+AyTdSyf9NWcmvrwijmKNI7ddwe4nH33ju1vV9/bey8h2YP8A/lPLgf1xxxWU3oKPG5a3xqF8DBFyY1pFkByswqorcJGLZ5J6M+sxMBKw7Wet/d6pyXYEyAEhsVATbpzI9B0FiHf1fidFd+73JNfiwYu0ArhW36Bqe5yhFJZmh0gbs2C+O72PgI5iUdr0i/2XFOn4FG8xVCh88u+PFPBI7qvsqMVOQc9OIA7Hr3q4459eiLxqi88Nfxt1OKKUbmIFe1OMayjG7zFAx02XL3nLnYaCqoDBtpQskdLebb/VLOZ3jbVHuJ',
		near: '46e60408a3dcab35e706dbd3ILP1Brs6d+TRzsCpVmiNcGIR7HcdMS99VyKFHP7l7Mc25dbBXAFiA4NDPj7DdFkKZ7aQ5HJTsoTJhRvZ/vIptu0P3nlyxC1lh+yISOzGHPVaLg=='
	};

	let listClues = document.querySelector('#clues-list');
	let btnStart = document.querySelector('#btn-start');

	let firstInputNode = makeInputNode();
	let dirInputNode = makeInputNode();
	let btnAppClue = document.createElement('button');
	let btnInspectClue = document.createElement('button');
	let btnNearClue = document.createElement('button');

	function makeInputNode() {
		let inputNode = document.createElement('input');
		inputNode.placeholder = 'Answer here...';
		inputNode.value = '';
		// Disable input memory and other special behaviours, especially from mobile devices.
		inputNode.autocapitalize = 'none';
		inputNode.autocomplete = 'off';
		inputNode.autocorrect = 'off';
		inputNode.spellcheck = false;
		return inputNode;
	}

	/** @throws */
	async function decipherClue(encrypted, passphraseCandidate) {
		passphraseCandidate = passphraseCandidate.replace(/[\s.]/g, '').toLowerCase();
		return await aesGcmDecrypt(encrypted, passphraseCandidate);
	}

	function appendClue(clue, opts) {
		let item = document.createElement('li');
		// Development:
		// console.log(clue);
		if (opts && opts.html) {
			item.innerHTML = clue;
		} else {
			item.textContent = clue;
		}
		item.tabIndex = '0';
		listClues.appendChild(item);
		return item;
	}

	btnStart.addEventListener('click', async () => {
		let item = appendClue(await decipherClue(encryptedClues.first, ''));
		item.append(document.createElement('br'));
		item.append(firstInputNode);
		firstInputNode.focus();

		btnStart.remove();
		btnStart = null;

		item.scrollIntoView(true);
	}, { once: true });

	firstInputNode.addEventListener('keyup', async () => {
		let secret;
		try {
			secret = await decipherClue(encryptedClues.dir, firstInputNode.value);
		} catch (e) {
			return;
		}

		firstInputNode.remove();

		let item = appendClue(secret);
		item.append(document.createElement('br'));
		item.append(dirInputNode);
		dirInputNode.focus();
	});

	dirInputNode.addEventListener('keyup', async () => {
		try {
			await decipherClue(encryptedClues.app, dirInputNode.value);
		} catch (e) {
			return;
		}

		dirInputNode.parentNode.append(btnAppClue);
		dirInputNode.remove();
		btnAppClue.focus();
	});

	btnAppClue.textContent = 'Next clue';
	btnAppClue.addEventListener('click', async () => {
		let item = appendClue(await decipherClue(encryptedClues.app, dirInputNode.value));
		item.append(document.createElement('br'));
		item.append(btnInspectClue);

		btnAppClue.remove();
		btnAppClue = null;

		item.focus();
	}, { once: true });

	btnInspectClue.textContent = 'But how?';
	btnInspectClue.addEventListener('click', async () => {
		let item = appendClue(await decipherClue(encryptedClues.inspect, dirInputNode.value), { html: true });
		item.append(document.createElement('br'));
		item.append(btnNearClue);

		btnInspectClue.remove();
		btnInspectClue = null;

		item.focus();
	}, { once: true });

	btnNearClue.textContent = 'OK, what am I looking for?';
	btnNearClue.addEventListener('click', async () => {
		let item = appendClue(await decipherClue(encryptedClues.near, dirInputNode.value));

		btnNearClue.remove();
		btnNearClue = null;

		item.focus();
	}, { once: true });

	// Development:
	// let newSecret = `<p>...</p>`;
	// console.log(await aesGcmEncrypt(newSecret, 'gps'));
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
