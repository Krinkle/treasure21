/*! Copyright 2021 Timo Tijhof <https://timotijhof.net> | MIT License */
function note() {
	const divTool = document.getElementById('note-tool');

	const noteEl = document.getElementById('note-encrypted');

	const btnTool = document.getElementById('btn-usetool');
	const btnOpen = document.createElement('button');
	const inputTool = makeInputNode('Name of cipher...');
	let toolEnabled = false;

	const toolHtmlEncrypted = `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`;

	function makeInputNode(placeholder) {
		let inputNode = document.createElement('input');
		inputNode.placeholder = placeholder || 'Answer here...';
		inputNode.value = '';
		// Disable input memory and other special behaviours, especially from mobile devices.
		inputNode.autocapitalize = 'none';
		inputNode.autocomplete = 'off';
		inputNode.autocorrect = 'off';
		inputNode.spellcheck = false;
		return inputNode;
	}

	btnTool.addEventListener('click', () => {
		let label = document.createElement('label');
		label.tabIndex = 0;
		label.textContent = `To use this tool, you must know the name of the cipher.`;
		label.append(document.createElement('br'));
		label.append(inputTool);

		btnOpen.textContent = 'Open tool';
		label.append(' ', btnOpen);

		btnTool.remove();
		divTool.append(label);
		divTool.hidden = false;

		label.focus();
	}, { once: true });

	btnOpen.addEventListener('click', () => {
		openTool();
	});

	inputTool.addEventListener('keyup', (e) => {
		// Support Firefox 88+: Workaround lingering validation bubble.
		// Bubble position is outdated/wrong after a page scroll.
		// If the player tried to open the tool, and is now typing again, clear it.
		// Note that even after clearing this, there is still a few seconds delay
		// before the browser actually removes the old bubble.
		inputTool.setCustomValidity(``);
		inputTool.reportValidity();

		if (e.code === 'Enter') {
			openTool();
		}
	});

	async function openTool() {
		const passphraseCandidate = inputTool.value.trim().toLowerCase().split(' ')[0].replace(/'?s$/, '');
		if (!passphraseCandidate) {
			return;
		}

		let toolHtmlDecrypted;
		try {
			toolHtmlDecrypted = await aesGcmDecrypt(toolHtmlEncrypted, passphraseCandidate);
		} catch (e) {
			inputTool.setCustomValidity(`Sorry, that's not it.`);
			inputTool.reportValidity();
			return;
		}

		// Development:
		// console.log(await aesGcmEncrypt(``, ''));

		// Support Firefox 88+: Workaround lingering validation bubble.
		// The validation message bubble stays behind even after
		// removing the input field. Reset and re-report to workaround.
		inputTool.setCustomValidity(``);
		inputTool.reportValidity();

		divTool.innerHTML = toolHtmlDecrypted;
		bindTool();
		divTool.focus();
		toolEnabled = true;
	}

	function bindTool() {
		const demoEl = divTool.querySelector('#note-demo-out');
		const inputEl = divTool.querySelector('#note-kb-offset');
		const btnApply = divTool.querySelector('#note-kb-apply');

		let lastNoteOffset = 0;
		async function doApply() {
			if (!toolEnabled) {
				return;
			}
			if (inputEl.value === lastNoteOffset) {
				// Avoid confusing/slow lock with nothing changing.
				return;
			}
			noteEl.classList.add('note--encrypted-revealed');

			inputEl.disabled = btnApply.disabled = true;
			toolEnabled = false;

			const hourglass = document.createTextNode(' ⏳');
			btnApply.parentNode.insertBefore(hourglass, btnApply.nextNode);

			const rel = inputEl.value - lastNoteOffset;
			lastNoteOffset = inputEl.value;
			noteEl.classList.add('note--encrypted-scan');
			await mutateAll(noteEl, rel);
			noteEl.classList.remove('note--encrypted-scan');

			hourglass.remove();
			toolEnabled = true;
			btnApply.textContent = 'Apply';
			inputEl.disabled = btnApply.disabled = false;
		}


		let lastDemoOffset = 0;
		inputEl.addEventListener('input', e => {
			const rel = inputEl.value - lastDemoOffset;
			lastDemoOffset = inputEl.value;
			mutateAllSync(demoEl, rel);
		});
		inputEl.addEventListener('keyup', e => {
			if (e.code === 'Enter') {
				e.preventDefault();
				doApply();
			}
		});
		btnApply.addEventListener('click', e => {
			doApply();
		});

		if (inputEl.value != 0) {
			// Reset form memory after refreshing page ("Do what I mean").
			// autocomplete="off" should suffice, but I'm not exactly sure.
			inputEl.value = 0;
		}
	}

	function mutate(offset, char) {
		offset = offset % 26;
		if (offset < 0) {
			offset = offset + 26;
		}
		const cc = char.charCodeAt(0);
		if (cc >= 65 && cc <= 90) {
			char = String.fromCharCode(65 + ((cc - 65 + offset) % 26));
		} else if ((cc >= 97) && (cc <= 122)) {
			char = String.fromCharCode(97 + ((cc - 97 + offset) % 26));
		}
		return char;
	}

	async function renderFrame(textNode, nodeValue) {
		return new Promise(resolve => {
			textNode.nodeValue = nodeValue;
			requestAnimationFrame(resolve);
		});
	}

	function mutateAllSync(element, offset) {
		const walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT
		);
		while (true) {
			const textNode = walker.nextNode();
			if (!textNode) {
				break;
			}
			const chars = textNode.nodeValue.split('');
			for (let i = 0; i < chars.length; i++) {
				textNode.nodeValue = textNode.nodeValue.slice(0, i) +
					mutate(offset, chars[i]) +
					textNode.nodeValue.slice(i + 1);
			}
		}
	}

	async function mutateAll(element, offset) {
		const walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT
		);

		// // One letter at a time, one paragraph at a time
		// while (true) {
		// 	const textNode = walker.nextNode();
		// 	if (!textNode) {
		// 		break;
		// 	}
		// 	const chars = textNode.nodeValue.split('');
		// 	for (let i = 0; i < chars.length; i++) {
		// 		await renderFrame(textNode,
		// 			textNode.nodeValue.slice(0, i) +
		// 			mutate(offset, chars[i]) +
		// 			textNode.nodeValue.slice(i + 1)
		// 		);
		// 	}
		// }

		const textNodes = [];
		while (true) {
			const textNode = walker.nextNode();
			if (!textNode) {
				break;
			}
			textNodes.push(textNode);
		}
		// One letter at a time, but process paragraphs concurrently.
		// Feels too slow otherwise.
		const renderPromises = [];
		for (let textNode of textNodes) {
			renderPromises.push((async () => {
				const chars = textNode.nodeValue.split('');
				for (let i = 0; i < chars.length; i++) {
					await renderFrame(textNode,
						textNode.nodeValue.slice(0, i) +
						'_' +
						textNode.nodeValue.slice(i + 1)
					);
					await renderFrame(textNode,
						textNode.nodeValue.slice(0, i) +
						mutate(offset, chars[i]) +
						textNode.nodeValue.slice(i + 1)
					);
				}
			})());
		}
		await Promise.all(renderPromises);
	}

}

window.DRIVE = { note: note };

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
